import type { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../../models/user";
import { ProfileModel } from "../../models/profile";
import { getNextSequence } from "../../models/counter";
import { DonorUserModel } from "../../models/donor-user";
import { RecipientUserModel } from "../../models/recipient-user";
import { HospitalUserModel } from "../../models/hospital-user";
import { ClinicUserModel } from "../../models/clinic-user";
import { AdminUserModel } from "../../models/admin-user";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { mapProfile } from "../../utils/serializers";
import { comparePassword, hashPassword } from "../../utils/password";

async function findUserById(userId: number) {
  return (
    (await DonorUserModel.findOne({ id: userId }).lean()) ||
    (await RecipientUserModel.findOne({ id: userId }).lean()) ||
    (await HospitalUserModel.findOne({ id: userId }).lean()) ||
    (await ClinicUserModel.findOne({ id: userId }).lean()) ||
    (await AdminUserModel.findOne({ id: userId }).lean())
  );
}

function getModelForRole(role?: string) {
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
      return null;

  }
}

function getDefaultRole(user: any): string {
  if (user instanceof DonorUserModel.prototype.constructor) return "donor";
  if (user instanceof RecipientUserModel.prototype.constructor) return "recipient";
  if (user instanceof HospitalUserModel.prototype.constructor) return "hospital";
  if (user instanceof ClinicUserModel.prototype.constructor) return "clinic";
  if (user instanceof AdminUserModel.prototype.constructor) return "admin";
  return "donor";
}

const updateSchema = z.object({
  full_name: z.string().min(2).optional(),
  email: z.string().email().nullable().optional(),
  mobile: z.string().min(6).optional(),
  address: z.string().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(8),
  new_password: z.string().min(8),
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const user = await findUserById(userId);
  const profile = await ProfileModel.findOne({ userId }).lean();

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  res.json(ok(mapProfile(user, profile)));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const body = updateSchema.parse(req.body);

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }
  const role = (user as any).role || getDefaultRole(user);
  const Model = getModelForRole(role);
  if (Model) {
    await Model.updateOne(
      { id: userId },
      {
        $set: {
          name: body.full_name || (user as any).name,
          ...(body.email === null ? { email: null } : body.email ? { email: body.email.toLowerCase() } : {}),
        },
      },
    );
  }

  if (body.mobile || body.address) {
    const existingProfile = await ProfileModel.findOne({ userId }).lean();
    if (existingProfile) {
      await ProfileModel.updateOne(
        { userId },
        {
          $set: {
            ...(body.mobile ? { phone: body.mobile } : {}),
            ...(body.address ? { address: body.address } : {}),
          },
        },
      );
    } else {
      await ProfileModel.create({
        id: await getNextSequence("profiles"),
        userId,
        phone: body.mobile ?? null,
        address: body.address ?? null,
        bloodGroup: null,
        dateOfBirth: null,
        hospitalName: null,
        registrationNumber: null,
        city: null,
        state: null,
        pincode: null,
        contactPerson: null,
      });
    }
  }
  const updated = await findUserById(userId);
  const profile = await ProfileModel.findOne({ userId }).lean();
  if (!updated) {
    throw new AppError(404, "User not found.");
  }

  res.json(ok(mapProfile(updated, profile), "Profile updated."));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const body = changePasswordSchema.parse(req.body);

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (!user.password) {
    throw new AppError(400, "Password is not set for this account.");
  }

  const valid = await comparePassword(body.current_password, user.password);
  if (!valid) {
    throw new AppError(400, "Current password is incorrect.");
  }

  const role = (user as any).role || getDefaultRole(user);
  const Model = getModelForRole(role);
  if (Model) {
    await Model.updateOne({ id: userId }, { $set: { password: await hashPassword(body.new_password) } });
  }
  
  res.json(ok({}, "Password changed successfully."));
});
