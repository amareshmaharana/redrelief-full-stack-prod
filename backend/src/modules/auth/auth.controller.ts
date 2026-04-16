import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import {
  forgotPasswordResetSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "./auth.schemas";
import { comparePassword, hashPassword } from "../../utils/password";
import { generateOtpCode, sendOtp, sendPasswordResetEmail } from "../../utils/otp";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { mapUserForSession } from "../../utils/serializers";
import { toBloodGroupEnum } from "../../utils/blood-group";
import type { OtpPurpose, Role } from "../../models/domain";
import { connectMongo } from "../../config/mongodb";
import { env } from "../../config/env";
import { getNextSequence } from "../../models/counter";
import { OtpCodeModel } from "../../models/otp-code";
import { ProfileModel } from "../../models/profile";
import { RefreshTokenModel } from "../../models/refresh-token";
import { UserModel, type User } from "../../models/user";
import { DonorUserModel, type DonorUser } from "../../models/donor-user";
import {
  RecipientUserModel,
  type RecipientUser,
} from "../../models/recipient-user";
import {
  HospitalUserModel,
  type HospitalUser,
} from "../../models/hospital-user";
import { ClinicUserModel, type ClinicUser } from "../../models/clinic-user";
import { AdminUserModel, type AdminUser } from "../../models/admin-user";

type RoleUser =
  | DonorUser
  | RecipientUser
  | HospitalUser
  | ClinicUser
  | AdminUser
  | User;

function getModelForRole(role: Role) {
  switch (role) {
    case "donor":
      return DonorUserModel;
    case "recipient":
      return RecipientUserModel;
    case "hospital":
      return HospitalUserModel;
    case "clinic":
      return ClinicUserModel;
    case "admin":
      return AdminUserModel;
    default:
      return UserModel;
  }
}

function getRegistrationModelForRole(role: Role) {
  switch (role) {
    case "donor":
      return DonorUserModel;
    case "recipient":
      return RecipientUserModel;
    case "hospital":
      return HospitalUserModel;
    case "clinic":
      return ClinicUserModel;
    case "admin":
      return AdminUserModel;
    default:
      throw new AppError(400, "Invalid role.");
  }
}

function requiresPassword(role: Role) {
  return role === "admin" || role === "hospital" || role === "clinic";
}

function hasOtpTarget(body: { email?: string | null; mobile?: string | null }) {
  return Boolean(
    (body.email && body.email.trim()) || (body.mobile && body.mobile.trim()),
  );
}

async function findUserByIdentifier(params: {
  email?: string;
  mobile?: string;
  role?: Role;
}) {
  await connectMongo();

  let user: RoleUser | null = null;

  if (params.role) {
    const Model = getModelForRole(params.role);
    if (params.email) {
      user =
        (await Model.findOne({ email: params.email.toLowerCase() }).lean()) ||
        (await UserModel.findOne({
          email: params.email.toLowerCase(),
          role: params.role,
        }).lean());
    } else if (params.mobile) {
      user = await Model.findOne({ phone: params.mobile }).lean();
      if (!user) {
        const profile = await ProfileModel.findOne({
          phone: params.mobile,
        }).lean();
        if (profile) {
          user = await UserModel.findOne({
            id: profile.userId,
            role: params.role,
          }).lean();
        }
      }
    }
  } else {
    // Search across all role models (for login without role specification)
    if (params.email) {
      user =
        (await DonorUserModel.findOne({
          email: params.email.toLowerCase(),
        }).lean()) ||
        (await RecipientUserModel.findOne({
          email: params.email.toLowerCase(),
        }).lean()) ||
        (await HospitalUserModel.findOne({
          email: params.email.toLowerCase(),
        }).lean()) ||
        (await ClinicUserModel.findOne({
          email: params.email.toLowerCase(),
        }).lean()) ||
        (await AdminUserModel.findOne({
          email: params.email.toLowerCase(),
        }).lean()) ||
        (await UserModel.findOne({ email: params.email.toLowerCase() }).lean());
    } else if (params.mobile) {
      user =
        (await DonorUserModel.findOne({ phone: params.mobile }).lean()) ||
        (await RecipientUserModel.findOne({ phone: params.mobile }).lean()) ||
        (await HospitalUserModel.findOne({ phone: params.mobile }).lean()) ||
        (await ClinicUserModel.findOne({ phone: params.mobile }).lean()) ||
        (await AdminUserModel.findOne({ phone: params.mobile }).lean());

      if (!user) {
        const profile = await ProfileModel.findOne({
          phone: params.mobile,
        }).lean();
        if (profile) {
          user = await UserModel.findOne({ id: profile.userId }).lean();
        }
      }
    }
  }

  if (!user) {
    return null;
  }

  if (
    !("role" in (user as Record<string, unknown>)) ||
    !(user as { role?: string }).role
  ) {
    if (params.role) {
      user = {
        ...(user as Record<string, unknown>),
        role: params.role,
      } as RoleUser;
    } else {
      user = {
        ...(user as Record<string, unknown>),
        role: getDefaultRoleForUser(user),
      } as RoleUser;
    }
  }

  const profile = await ProfileModel.findOne({ userId: user.id }).lean();
  return { user: user as any, profile };
}

async function createAndSendOtp(params: {
  email?: string;
  mobile?: string;
  purpose: OtpPurpose;
  role?: Role;
  payload?: Record<string, unknown>;
}) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const otpRecord = await OtpCodeModel.create({
    id: await getNextSequence("otpCodes"),
    code,
    purpose: params.purpose,
    targetEmail: params.email?.toLowerCase() ?? null,
    targetPhone: params.mobile ?? null,
    role: params.role ?? null,
    payloadJson: params.payload ?? null,
    expiresAt,
    consumedAt: null,
  });

  try {
    await sendOtp(
      {
        email: params.email,
        phone: params.mobile,
      },
      code,
      params.purpose,
    );
  } catch (error) {
    await OtpCodeModel.deleteOne({ id: otpRecord.id });
    throw new AppError(
      502,
      error instanceof Error ? error.message : "Failed to deliver OTP.",
    );
  }
}

async function assertRegistrationTargetAvailable(params: {
  email?: string | null;
  mobile?: string | null;
}) {
  if (params.email) {
    const existingEmail =
      (await DonorUserModel.findOne({
        email: params.email.toLowerCase(),
      }).lean()) ||
      (await RecipientUserModel.findOne({
        email: params.email.toLowerCase(),
      }).lean()) ||
      (await HospitalUserModel.findOne({
        email: params.email.toLowerCase(),
      }).lean()) ||
      (await ClinicUserModel.findOne({
        email: params.email.toLowerCase(),
      }).lean()) ||
      (await AdminUserModel.findOne({
        email: params.email.toLowerCase(),
      }).lean()) ||
      (await UserModel.findOne({ email: params.email.toLowerCase() }).lean());
    if (existingEmail) {
      throw new AppError(409, "Email already registered.");
    }
  }

  if (params.mobile) {
    const existingPhone = await ProfileModel.findOne({
      phone: params.mobile,
    }).lean();
    if (existingPhone) {
      throw new AppError(409, "Mobile already registered.");
    }
  }
}

async function issueSession(user: RoleUser) {
  const access = signAccessToken(
    user.id,
    (user as any).role || getDefaultRoleForUser(user),
  );
  const refresh = signRefreshToken(user.id);

  await RefreshTokenModel.create({
    id: await getNextSequence("refreshTokens"),
    userId: user.id,
    token: refresh,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const profile = await ProfileModel.findOne({ userId: user.id }).lean();

  return {
    tokens: {
      access,
      refresh,
    },
    user: mapUserForSession(user as any, profile),
  };
}

function getDefaultRoleForUser(user: RoleUser): Role {
  const candidate = user as Record<string, unknown>;
  if (typeof candidate.role === "string") {
    return candidate.role as Role;
  }
  if ("hospitalName" in candidate) return "hospital";
  if ("clinicName" in candidate) return "clinic";
  if ("medicalCondition" in candidate) return "recipient";
  if ("permissions" in candidate) return "admin";
  if ("bloodGroup" in candidate) return "donor";
  return "donor"; // fallback
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = registerSchema.parse(req.body);

  if (!hasOtpTarget(payload)) {
    throw new AppError(400, "Email or mobile is required.");
  }

  await assertRegistrationTargetAvailable({
    email: payload.email,
    mobile: payload.mobile,
  });

  res.status(201).json(
    ok(
      {
        email: payload.email ?? null,
        mobile: payload.mobile ?? null,
        role: payload.role,
      },
      "Registration initiated. Click Send OTP on verify page to continue.",
    ),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = loginSchema.parse(req.body);

  const identity = await findUserByIdentifier({
    email: payload.email,
    mobile: payload.mobile,
    role: payload.role,
  });

  if (!identity) {
    throw new AppError(401, "Invalid credentials.");
  }

  if (requiresPassword(payload.role)) {
    if (!payload.password || !identity.user.password) {
      throw new AppError(401, "Invalid credentials.");
    }

    const matches = await comparePassword(
      payload.password,
      identity.user.password,
    );
    if (!matches) {
      throw new AppError(401, "Invalid credentials.");
    }
  }

  const session = await issueSession(identity.user);

  res.json(ok(session, "Login successful."));
});

export const sendOtpCode = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = sendOtpSchema.parse(req.body);

  const purpose = payload.purpose as OtpPurpose;

  if (purpose === "register") {
    if (!payload.registration_payload) {
      throw new AppError(
        400,
        "Registration payload is required for register OTP.",
      );
    }

    const registration = registerSchema.parse(payload.registration_payload);

    if (!hasOtpTarget(registration)) {
      throw new AppError(400, "Email or mobile is required.");
    }

    await assertRegistrationTargetAvailable({
      email: registration.email,
      mobile: registration.mobile,
    });

    const hashedPassword = registration.password
      ? await hashPassword(registration.password)
      : null;

    await createAndSendOtp({
      email: registration.email ?? undefined,
      mobile: registration.mobile,
      purpose,
      role: registration.role,
      payload: {
        full_name: registration.full_name,
        mobile: registration.mobile,
        email: registration.email ?? null,
        password_hash: hashedPassword,
        role: registration.role,
        blood_group: registration.blood_group ?? null,
        address: registration.address ?? null,
        date_of_birth: registration.date_of_birth ?? null,
        hospital_name: registration.hospital_name ?? null,
        registration_number: registration.registration_number ?? null,
        city: registration.city ?? null,
        state: registration.state ?? null,
        pincode: registration.pincode ?? null,
        contact_person: registration.contact_person ?? null,
      },
    });

    res.json(ok({}, "OTP sent for register."));
    return;
  }

  if (!hasOtpTarget(payload)) {
    throw new AppError(400, "Email or mobile is required.");
  }

  const identity = await findUserByIdentifier({
    email: payload.email,
    mobile: payload.mobile,
  });
  if (!identity) {
    throw new AppError(404, "User not found.");
  }

  await createAndSendOtp({
    email: payload.email,
    mobile: payload.mobile,
    purpose,
  });

  res.json(ok({}, `OTP sent for ${purpose.replace("_", " ")}.`));
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = verifyOtpSchema.parse(req.body);

  if (!hasOtpTarget(payload)) {
    throw new AppError(400, "Email or mobile is required.");
  }

  const otpQuery: Record<string, unknown> = {
    code: payload.code,
    purpose: payload.purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  };

  if (payload.email) {
    otpQuery.targetEmail = payload.email.toLowerCase();
  }

  if (payload.mobile) {
    otpQuery.targetPhone = payload.mobile;
  }

  const otpRecord = await OtpCodeModel.findOne(otpQuery)
    .sort({ createdAt: -1 })
    .lean();

  if (!otpRecord) {
    throw new AppError(400, "Invalid or expired OTP.");
  }

  if (payload.purpose === "register") {
    const data = otpRecord.payloadJson as Record<string, unknown> | null;
    if (!data) {
      throw new AppError(400, "Registration payload missing.");
    }

    const email =
      typeof data.email === "string" ? data.email.toLowerCase() : null;
    const mobile = typeof data.mobile === "string" ? data.mobile : null;

    if (!email && !mobile) {
      throw new AppError(400, "Invalid registration payload.");
    }

    const existing = await findUserByIdentifier({
      email: email ?? undefined,
      mobile: mobile ?? undefined,
    });
    if (existing) {
      throw new AppError(409, "Account already exists.");
    }

    const role = data.role as Role;
    const Model = getRegistrationModelForRole(role);

    const userData: any = {
      id: await getNextSequence("users"),
      name: String(data.full_name ?? "User"),
      email,
      password:
        typeof data.password_hash === "string" ? data.password_hash : null,
      role,
      isVerified: true,
    };

    // Add role-specific fields
    if (role === "donor" || role === "recipient") {
      (userData as any).bloodGroup = toBloodGroupEnum(
        typeof data.blood_group === "string" ? data.blood_group : null,
      );
      (userData as any).phone = mobile;
      (userData as any).dateOfBirth =
        typeof data.date_of_birth === "string" && data.date_of_birth
          ? new Date(`${data.date_of_birth}T00:00:00.000Z`)
          : null;
    }

    if (role === "donor") {
      // Donor specific fields already set above
    }

    if (role === "recipient") {
      // Recipient can have medicalCondition
      (userData as any).medicalCondition = data.medical_condition ?? null;
    }

    if (role === "hospital" || role === "clinic") {
      const orgName =
        (typeof data.hospital_name === "string" && data.hospital_name.trim()) ||
        (typeof data.clinic_name === "string" && data.clinic_name.trim()) ||
        String(data.full_name ?? "Organization");

      (userData as any).hospitalName =
        role === "hospital" ? orgName : undefined;
      (userData as any).clinicName = role === "clinic" ? orgName : undefined;
      (userData as any).registrationNumber = data.registration_number ?? null;
      (userData as any).phone = mobile;
      (userData as any).address = data.address ?? null;
      (userData as any).city = data.city ?? null;
      (userData as any).state = data.state ?? null;
      (userData as any).pincode = data.pincode ?? null;
      (userData as any).contactPerson = data.contact_person ?? null;
    }

    if (role === "admin") {
      (userData as any).phone = mobile;
      (userData as any).permissions = [];
    }

    const user = await Model.create(userData);

    // Also create a profile for backward compatibility
    await ProfileModel.create({
      id: await getNextSequence("profiles"),
      userId: user.id,
      phone: mobile,
      address: data.address ?? null,
      bloodGroup: toBloodGroupEnum(
        typeof data.blood_group === "string" ? data.blood_group : null,
      ),
      dateOfBirth:
        typeof data.date_of_birth === "string" && data.date_of_birth
          ? new Date(`${data.date_of_birth}T00:00:00.000Z`)
          : null,
      hospitalName: data.hospital_name ?? null,
      registrationNumber: data.registration_number ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      pincode: data.pincode ?? null,
      contactPerson: data.contact_person ?? null,
    });

    await OtpCodeModel.updateOne(
      { id: otpRecord.id },
      { $set: { consumedAt: new Date() } },
    );

    const session = await issueSession(user.toObject());

    res.status(201).json(ok(session, "Registration successful."));
    return;
  }

  if (payload.purpose === "login") {
    const identity = await findUserByIdentifier({
      email: payload.email,
      mobile: payload.mobile,
    });
    if (!identity) {
      throw new AppError(404, "User not found.");
    }

    await OtpCodeModel.updateOne(
      { id: otpRecord.id },
      { $set: { consumedAt: new Date() } },
    );

    const session = await issueSession(identity.user);
    res.json(ok(session, "Login successful."));
    return;
  }

  await OtpCodeModel.updateOne(
    { id: otpRecord.id },
    { $set: { consumedAt: new Date() } },
  );
  res.json(ok({}, "OTP verified."));
});

export const forgotPasswordSendOtp = asyncHandler(
  async (req: Request, res: Response) => {
    await connectMongo();

    const payload = forgotPasswordSchema.parse(req.body);

    const identity = await findUserByIdentifier({ email: payload.email });

    // Always return a generic success response to prevent account enumeration.
    if (!identity || !payload.email) {
      res.json(ok({}, "If an account exists for this email, a reset link has been sent."));
      return;
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await OtpCodeModel.create({
      id: await getNextSequence("otpCodes"),
      code: token,
      purpose: "password_reset",
      targetEmail: payload.email.toLowerCase(),
      targetPhone: null,
      role: getDefaultRoleForUser(identity.user),
      payloadJson: { userId: identity.user.id },
      expiresAt,
      consumedAt: null,
    });

    const frontendBase = env.FRONTEND_URL ?? env.CORS_ORIGIN;
    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(payload.email.toLowerCase(), resetLink);

    res.json(ok({}, "Check your email for a secure password reset link."));
  },
);

export const forgotPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    await connectMongo();

    const payload = forgotPasswordResetSchema.parse(req.body);

    const otpQuery: Record<string, unknown> = {
      code: payload.token,
      purpose: "password_reset",
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    };

    const otpRecord = await OtpCodeModel.findOne(otpQuery)
      .sort({ createdAt: -1 })
      .lean();
    if (!otpRecord) {
      throw new AppError(400, "Invalid or expired reset link.");
    }

    const targetEmail = otpRecord.targetEmail ?? undefined;
    const identity = await findUserByIdentifier({ email: targetEmail });

    if (!identity) {
      throw new AppError(404, "User not found.");
    }

    const newHash = await hashPassword(payload.new_password);
    const role = getDefaultRoleForUser(identity.user);
    const Model = getModelForRole(role);

    await Promise.all([
      Model.updateOne(
        { id: identity.user.id },
        { $set: { password: newHash } },
      ),
      OtpCodeModel.updateOne(
        { id: otpRecord.id },
        { $set: { consumedAt: new Date() } },
      ),
      RefreshTokenModel.deleteMany({ userId: identity.user.id }),
    ]);

    res.json(ok({}, "Password reset successful."));
  },
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    await connectMongo();

    const payload = refreshTokenSchema.parse(req.body);

    const tokenRecord = await RefreshTokenModel.findOne({
      token: payload.refresh,
    }).lean();
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError(401, "Invalid refresh token.");
    }

    const decoded = verifyRefreshToken(payload.refresh);
    const userId = Number(decoded.sub);

    const user =
      (await DonorUserModel.findOne({ id: userId }).lean()) ||
      (await RecipientUserModel.findOne({ id: userId }).lean()) ||
      (await HospitalUserModel.findOne({ id: userId }).lean()) ||
      (await ClinicUserModel.findOne({ id: userId }).lean()) ||
      (await AdminUserModel.findOne({ id: userId }).lean());
    if (!user) {
      throw new AppError(401, "Invalid refresh token.");
    }

    const access = signAccessToken(user.id, getDefaultRoleForUser(user));

    res.json(ok({ access }, "Token refreshed."));
  },
);
