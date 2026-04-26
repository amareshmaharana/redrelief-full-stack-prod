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

function getRegistrationModelForRole(role: Role): typeof DonorUserModel | typeof RecipientUserModel | typeof HospitalUserModel | typeof ClinicUserModel | typeof AdminUserModel | typeof UserModel {
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

function normalizeEmailInput(email?: string | null) {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized || null;
}

async function findUserByIdentifier(params: {
  email?: string;
  mobile?: string;
}) {
  await connectMongo();

  let user: RoleUser | null = null;
  if (params.email) {
    const normalizedEmail = normalizeEmailInput(params.email);
    if (!normalizedEmail) {
      return null;
    }

    user =
      (await DonorUserModel.findOne({ email: normalizedEmail }).lean()) ||
      (await RecipientUserModel.findOne({ email: normalizedEmail }).lean()) ||
      (await HospitalUserModel.findOne({ email: normalizedEmail }).lean()) ||
      (await ClinicUserModel.findOne({ email: normalizedEmail }).lean()) ||
      (await AdminUserModel.findOne({ email: normalizedEmail }).lean()) ||
      (await UserModel.findOne({ email: normalizedEmail }).lean());
  } else if (params.mobile) {
    user =
      (await DonorUserModel.findOne({ phone: params.mobile }).lean()) ||
      (await RecipientUserModel.findOne({ phone: params.mobile }).lean()) ||
      (await HospitalUserModel.findOne({ phone: params.mobile }).lean()) ||
      (await ClinicUserModel.findOne({ phone: params.mobile }).lean()) ||
      (await AdminUserModel.findOne({ phone: params.mobile }).lean());

    if (!user) {
      const profile = await ProfileModel.findOne({ phone: params.mobile }).lean();
      if (profile) {
        user = await UserModel.findOne({ id: profile.userId }).lean();
      }
    }
  }

  if (!user) {
    return null;
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
    targetEmail: normalizeEmailInput(params.email),
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
  const normalizedEmail = normalizeEmailInput(params.email);

  if (normalizedEmail) {
    const existingEmail =
      (await DonorUserModel.findOne({
        email: normalizedEmail,
      }).lean()) ||
      (await RecipientUserModel.findOne({
        email: normalizedEmail,
      }).lean()) ||
      (await HospitalUserModel.findOne({
        email: normalizedEmail,
      }).lean()) ||
      (await ClinicUserModel.findOne({
        email: normalizedEmail,
      }).lean()) ||
      (await AdminUserModel.findOne({
        email: normalizedEmail,
      }).lean()) ||
      (await UserModel.findOne({ email: normalizedEmail }).lean());
    if (existingEmail) {
      throw new AppError(409, "Email already registered. Please login.");
    }
  }

  if (params.mobile) {
    const existingPhone = await ProfileModel.findOne({
      phone: params.mobile,
    }).lean();
    if (existingPhone) {
      throw new AppError(409, "Mobile already registered. Please login.");
    }
  }
}

async function issueSession(user: RoleUser) {
  const access = signAccessToken(user.id, user.role);
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

export const register = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = registerSchema.parse(req.body);

  const role = payload.role;
  const Model = getRegistrationModelForRole(role);
  const normalizedEmail = normalizeEmailInput(payload.email);
  const normalizedMobile = payload.mobile ?? null;

  const existingByEmail = normalizedEmail
    ? await Model.findOne({ email: normalizedEmail }).lean()
    : null;
  const existingByPhone = !existingByEmail && normalizedMobile
    ? await Model.findOne({ phone: normalizedMobile }).lean()
    : null;
  const existing = existingByEmail ?? existingByPhone;

  if (existing) {
    if (requiresPassword(role)) {
      if (!payload.password || !existing.password) {
        throw new AppError(401, "Invalid credentials.");
      }
      const matches = await comparePassword(payload.password, existing.password);
      if (!matches) {
        throw new AppError(401, "Invalid credentials.");
      }
    }

    const session = await issueSession(existing as RoleUser);
    res.json(ok(session, "Account already exists. Logged in."));
    return;
  }

  const hashedPassword = payload.password
    ? await hashPassword(payload.password)
    : null;

  const userData: any = {
    id: await getNextSequence("users"),
    name: String(payload.full_name ?? "User"),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    isVerified: true,
  };

  if (role === "donor" || role === "recipient") {
    userData.bloodGroup = toBloodGroupEnum(payload.blood_group ?? null);
    userData.phone = payload.mobile ?? null;
    userData.dateOfBirth = payload.date_of_birth
      ? new Date(`${payload.date_of_birth}T00:00:00.000Z`)
      : null;
  }

  if (role === "recipient") {
    userData.medicalCondition = null;
  }

  if (role === "hospital" || role === "clinic") {
    const orgName =
      (typeof payload.hospital_name === "string" && payload.hospital_name.trim()) ||
      String(payload.full_name ?? "Organization");

    userData.hospitalName = role === "hospital" ? orgName : undefined;
    userData.clinicName = role === "clinic" ? orgName : undefined;
    userData.registrationNumber = payload.registration_number ?? null;
    userData.phone = payload.mobile ?? null;
    userData.address = payload.address ?? null;
    userData.city = payload.city ?? null;
    userData.state = payload.state ?? null;
    userData.pincode = payload.pincode ?? null;
    userData.contactPerson = payload.contact_person ?? null;
  }

  if (role === "admin") {
    userData.phone = payload.mobile ?? null;
    userData.permissions = [];
  }

  let user: any;
  try {
    user = await Model.create(userData);
  } catch (error) {
    const mongoError = error as {
      code?: number;
      keyPattern?: Record<string, unknown>;
    };
    if (mongoError.code !== 11000) {
      throw error;
    }

    const duplicateKey = mongoError.keyPattern
      ? Object.keys(mongoError.keyPattern)[0]
      : undefined;

    if (duplicateKey === "registrationNumber") {
      throw new AppError(
        409,
        "Registration number already registered. Please use a different registration number.",
      );
    }

    if (duplicateKey === "email") {
      throw new AppError(409, "Email already registered. Please login.");
    }

    if (duplicateKey === "phone") {
      throw new AppError(409, "Mobile already registered. Please login.");
    }

    const fallbackExistingByEmail = normalizedEmail
      ? await Model.findOne({ email: normalizedEmail }).lean()
      : null;
    const fallbackExistingByPhone = !fallbackExistingByEmail && normalizedMobile
      ? await Model.findOne({ phone: normalizedMobile }).lean()
      : null;
    const fallbackExisting = fallbackExistingByEmail ?? fallbackExistingByPhone;

    if (!fallbackExisting) {
      throw new AppError(409, "Account already exists. Please login.");
    }

    const session = await issueSession(fallbackExisting as RoleUser);
    res.json(ok(session, "Account already exists. Logged in."));
    return;
  }

  try {
    await ProfileModel.create({
      id: await getNextSequence("profiles"),
      userId: user.id,
      phone: payload.mobile ?? null,
      address: payload.address ?? null,
      bloodGroup: toBloodGroupEnum(payload.blood_group ?? null),
      dateOfBirth: payload.date_of_birth
        ? new Date(`${payload.date_of_birth}T00:00:00.000Z`)
        : null,
      hospitalName: payload.hospital_name ?? null,
      registrationNumber: payload.registration_number ?? null,
      city: payload.city ?? null,
      state: payload.state ?? null,
      pincode: payload.pincode ?? null,
      contactPerson: payload.contact_person ?? null,
    });
  } catch (error) {
    const mongoError = error as { code?: number };
    if (mongoError.code !== 11000) {
      throw error;
    }
  }

  const session = await issueSession((user as any).toObject());

  res.status(201).json(
    ok(session, "Registration successful."),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = loginSchema.parse(req.body);
  const normalizedEmail = normalizeEmailInput(payload.email);

  if (!normalizedEmail) {
    throw new AppError(400, "Email is required.");
  }

  const identity = await findUserByIdentifier({
    email: normalizedEmail,
  });

  if (!identity) {
    throw new AppError(401, "Invalid credentials.");
  }

  if (requiresPassword(identity.user.role)) {
    if (!payload.password || !identity.user.password) {
      throw new AppError(401, "Invalid credentials.");
    }

    const matches = await comparePassword(payload.password, identity.user.password);
    if (!matches) {
      throw new AppError(401, "Invalid credentials.");
    }
  }

  const session = await issueSession(identity.user);

  res.json(ok(session, "Login successful."));
});

export const checkEmailRole = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const { email } = req.body as { email?: string };

  if (!email || !email.trim()) {
    throw new AppError(400, "Email is required.");
  }

  const normalizedEmail = normalizeEmailInput(email);
  const identity = normalizedEmail
    ? await findUserByIdentifier({ email: normalizedEmail })
    : null;

  if (!identity) {
    res.status(404).json(ok({}, "User not found."));
    return;
  }

  res.json(
    ok(
      {
        role: identity.user.role,
        requiresPassword: requiresPassword(identity.user.role),
      },
      "Role found.",
    ),
  );
});

export const sendOtpCode = asyncHandler(async (req: Request, res: Response) => {
  await connectMongo();

  const payload = sendOtpSchema.parse(req.body);

  const purpose = payload.purpose as OtpPurpose;

  if (purpose === "register") {
    throw new AppError(400, "Register OTP is no longer supported.");
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
    otpQuery.targetEmail = normalizeEmailInput(payload.email);
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
    throw new AppError(400, "Register OTP is no longer supported.");
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
    const normalizedEmail = normalizeEmailInput(payload.email);

    if (!identity || !normalizedEmail) {
      res.json(ok({}, "If an account exists for this email, a reset link has been sent."));
      return;
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await OtpCodeModel.create({
      id: await getNextSequence("otpCodes"),
      code: token,
      purpose: "password_reset",
      targetEmail: normalizedEmail,
      targetPhone: null,
      role: identity.user.role,
      payloadJson: { userId: identity.user.id },
      expiresAt,
      consumedAt: null,
    });

    const frontendBase = env.FRONTEND_URL ?? env.CORS_ORIGIN;
    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(normalizedEmail, resetLink);

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
    const role = identity.user.role;
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

    const access = signAccessToken(user.id, user.role);

    res.json(ok({ access }, "Token refreshed."));
  },
);
