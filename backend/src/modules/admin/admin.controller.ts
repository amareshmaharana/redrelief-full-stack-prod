import type { Request, Response } from "express";
import { z } from "zod";
import { CampModel } from "../../models/camp";
import { BloodStockModel } from "../../models/blood-stock";
import { RequestModel } from "../../models/request";
import { ProfileModel } from "../../models/profile";
import { UserModel } from "../../models/user";
import { DonorUserModel } from "../../models/donor-user";
import { RecipientUserModel } from "../../models/recipient-user";
import { HospitalUserModel } from "../../models/hospital-user";
import { ClinicUserModel } from "../../models/clinic-user";
import { AdminUserModel } from "../../models/admin-user";
import { getNextSequence } from "../../models/counter";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { mapUserForSession } from "../../utils/serializers";
import { addStock, listStock } from "../bloodStock/blood-stock.service";
import { listRequestsForAdmin, reviewRequest } from "../request/request.service";
import type { RequestStatus, RequestType, Role } from "../../models/domain";

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: Role;
  };
};

async function findUserById(userId: number) {
  return (
    (await DonorUserModel.findOne({ id: userId }).lean()) ||
    (await RecipientUserModel.findOne({ id: userId }).lean()) ||
    (await HospitalUserModel.findOne({ id: userId }).lean()) ||
    (await ClinicUserModel.findOne({ id: userId }).lean()) ||
    (await AdminUserModel.findOne({ id: userId }).lean())
  );
}

async function getAllUsers() {
  const [donors, recipients, hospitals, clinics, admins] = await Promise.all([
    DonorUserModel.find().sort({ createdAt: -1 }).lean(),
    RecipientUserModel.find().sort({ createdAt: -1 }).lean(),
    HospitalUserModel.find().sort({ createdAt: -1 }).lean(),
    ClinicUserModel.find().sort({ createdAt: -1 }).lean(),
    AdminUserModel.find().sort({ createdAt: -1 }).lean(),
  ]);
  return [...donors, ...recipients, ...hospitals, ...clinics, ...admins];
}

async function getHospitalAndClinicUsers() {
  const [hospitals, clinics] = await Promise.all([
    HospitalUserModel.find().sort({ name: 1 }).lean(),
    ClinicUserModel.find().sort({ name: 1 }).lean(),
  ]);
  return [...hospitals, ...clinics];
}

const userVerificationSchema = z.object({
  is_verified: z.boolean(),
});

const campUpsertSchema = z.object({
  camp_name: z.string().trim().min(2).optional(),
  location: z.string().trim().min(2).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .optional(),
  description: z.string().optional(),
});

const adminUpdateStockSchema = z.object({
  blood_group: z.string().min(2).optional(),
  units: z.number().int().positive().optional(),
  expiry_date: z.string().min(8).optional(),
});

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  admin_message: z.string().optional().default(""),
});

async function loadUsersWithProfiles() {
  const [users, profiles] = await Promise.all([getAllUsers(), ProfileModel.find().lean()]);
  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));
  return users.map((user) => ({ user, profile: profileByUserId.get(user.id) ?? null }));
}

export const adminUsers = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await loadUsersWithProfiles();
  res.json(
    ok(
      rows.map(({ user, profile }) => ({
        ...mapUserForSession(user, profile),
        is_verified: user.isVerified,
        is_active: true,
        date_joined: user.createdAt.toISOString(),
      })),
    ),
  );
});

export const adminUpdateUserVerification = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (Number.isNaN(userId)) {
    throw new AppError(400, "Invalid user id.");
  }

  const payload = userVerificationSchema.parse(req.body);

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }

  const models = [DonorUserModel, RecipientUserModel, HospitalUserModel, ClinicUserModel, AdminUserModel];
  await Promise.all(models.map(model => model.updateOne({ id: userId }, { $set: { isVerified: payload.is_verified } }).catch(() => {})));

  res.json(ok({}, payload.is_verified ? "User verified." : "User marked as pending verification."));
});

export const adminCamps = asyncHandler(async (_req: Request, res: Response) => {
  const camps = await CampModel.find().sort({ date: 1 }).lean();
  res.json(
    ok(
      camps.map((camp) => ({
        id: camp.id,
        camp_name: camp.campName,
        location: camp.location,
        date: camp.date.toISOString().slice(0, 10),
        description: camp.description,
      })),
    ),
  );
});

export const adminCreateCamp = asyncHandler(async (req: Request, res: Response) => {
  const payload = z
    .object({
      camp_name: z.string().trim().min(2),
      location: z.string().trim().min(2),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
      description: z.string().optional().default(""),
    })
    .parse(req.body);

  const normalizedDate = new Date(`${payload.date}T00:00:00.000Z`);
  if (Number.isNaN(normalizedDate.getTime())) {
    throw new AppError(400, "Invalid camp date.");
  }

  const created = await CampModel.create({
    id: await getNextSequence("camps"),
    campName: payload.camp_name,
    location: payload.location,
    date: normalizedDate,
    description: payload.description,
  });

  res.status(201).json(
    ok(
      {
        id: created.id,
        camp_name: created.campName,
        location: created.location,
        date: created.date.toISOString().slice(0, 10),
        description: created.description,
      },
      "Camp created.",
    ),
  );
});

export const adminUpdateCamp = asyncHandler(async (req: Request, res: Response) => {
  const campId = Number(req.params.campId);
  if (Number.isNaN(campId)) {
    throw new AppError(400, "Invalid camp id.");
  }

  const payload = campUpsertSchema.parse(req.body);
  const existing = await CampModel.findOne({ id: campId }).lean();
  if (!existing) {
    throw new AppError(404, "Camp not found.");
  }

  const parsedDate = payload.date ? new Date(`${payload.date}T00:00:00.000Z`) : existing.date;
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(400, "Invalid camp date.");
  }

  const updated = await CampModel.findOneAndUpdate(
    { id: campId },
    {
      $set: {
        campName: payload.camp_name ?? existing.campName,
        location: payload.location ?? existing.location,
        date: parsedDate,
        description: payload.description ?? existing.description,
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new AppError(404, "Camp not found.");
  }

  res.json(
    ok(
      {
        id: updated.id,
        camp_name: updated.campName,
        location: updated.location,
        date: updated.date.toISOString().slice(0, 10),
        description: updated.description,
      },
      "Camp updated.",
    ),
  );
});

export const adminDeleteCamp = asyncHandler(async (req: Request, res: Response) => {
  const campId = Number(req.params.campId);
  if (Number.isNaN(campId)) {
    throw new AppError(400, "Invalid camp id.");
  }

  const existing = await CampModel.findOne({ id: campId }).lean();
  if (!existing) {
    throw new AppError(404, "Camp not found.");
  }

  await CampModel.deleteOne({ id: campId });
  res.json(ok({}, "Camp deleted."));
});

export const adminRequests = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok(await listRequestsForAdmin()));
});

export const reviewDonationRequest = asyncHandler(async (req: Request, res: Response) => {
  const requestId = Number(req.params.requestId);
  if (Number.isNaN(requestId)) {
    throw new AppError(400, "Invalid request id.");
  }
  const payload = reviewSchema.parse(req.body);
  await reviewRequest(requestId, "donation" as RequestType, payload.status as RequestStatus, payload.admin_message);
  res.json(ok({}, "Donation request reviewed."));
});

export const reviewBloodRequest = asyncHandler(async (req: Request, res: Response) => {
  const requestId = Number(req.params.requestId);
  if (Number.isNaN(requestId)) {
    throw new AppError(400, "Invalid request id.");
  }
  const payload = reviewSchema.parse(req.body);
  await reviewRequest(requestId, "blood" as RequestType, payload.status as RequestStatus, payload.admin_message);
  res.json(ok({}, "Blood request reviewed."));
});

export const adminStock = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok(await listStock()));
});

export const adminAddStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = z
    .object({
      blood_group: z.string().min(2),
      units: z.number().int().positive(),
      expiry_date: z.string().min(8),
      hospital_id: z.number().int().positive().optional(),
    })
    .parse(req.body);

  const hospital = payload.hospital_id
    ? await findUserById(payload.hospital_id)
    : (await getHospitalAndClinicUsers())[0] ?? null;

  const fallbackOwnerId = req.user?.id;
  const stockOwnerId = hospital?.id ?? fallbackOwnerId;

  if (!stockOwnerId) {
    throw new AppError(404, "Stock owner user not found.");
  }

  const created = await addStock({
    hospitalId: stockOwnerId,
    blood_group: payload.blood_group,
    units: payload.units,
    expiry_date: payload.expiry_date,
  });

  res.status(201).json(ok(created, "Stock added."));
});

export const adminUpdateStock = asyncHandler(async (req: Request, res: Response) => {
  const stockId = Number(req.params.stockId);
  if (Number.isNaN(stockId)) {
    throw new AppError(400, "Invalid stock id.");
  }

  const payload = adminUpdateStockSchema.parse(req.body);
  const existing = await BloodStockModel.findOne({ id: stockId }).lean();
  if (!existing) {
    throw new AppError(404, "Stock item not found.");
  }

  const bloodGroup = payload.blood_group
    ? ({
        "A+": "A_POS",
        "A-": "A_NEG",
        "B+": "B_POS",
        "B-": "B_NEG",
        "AB+": "AB_POS",
        "AB-": "AB_NEG",
        "O+": "O_POS",
        "O-": "O_NEG",
      }[payload.blood_group] as
        | "A_POS"
        | "A_NEG"
        | "B_POS"
        | "B_NEG"
        | "AB_POS"
        | "AB_NEG"
        | "O_POS"
        | "O_NEG"
        | undefined)
    : undefined;

  if (payload.blood_group && !bloodGroup) {
    throw new AppError(400, "Invalid blood group.");
  }

  const updated = await BloodStockModel.findOneAndUpdate(
    { id: stockId },
    {
      $set: {
        bloodGroup: bloodGroup ?? existing.bloodGroup,
        unitsAvailable: payload.units ?? existing.unitsAvailable,
        expiryDate: payload.expiry_date ? new Date(payload.expiry_date) : existing.expiryDate,
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new AppError(404, "Stock item not found.");
  }

  const reverseGroup = {
    A_POS: "A+",
    A_NEG: "A-",
    B_POS: "B+",
    B_NEG: "B-",
    AB_POS: "AB+",
    AB_NEG: "AB-",
    O_POS: "O+",
    O_NEG: "O-",
  } as const;

  res.json(
    ok(
      {
        id: updated.id,
        blood_group: reverseGroup[updated.bloodGroup as keyof typeof reverseGroup],
        units: updated.unitsAvailable,
        expiry_date: updated.expiryDate.toISOString().slice(0, 10),
        created_at: updated.createdAt.toISOString(),
      },
      "Stock updated.",
    ),
  );
});

export const adminDeleteStock = asyncHandler(async (req: Request, res: Response) => {
  const stockId = Number(req.params.stockId);
  if (Number.isNaN(stockId)) {
    throw new AppError(400, "Invalid stock id.");
  }

  const existing = await BloodStockModel.findOne({ id: stockId }).lean();
  if (!existing) {
    throw new AppError(404, "Stock item not found.");
  }

  await BloodStockModel.deleteOne({ id: stockId });
  res.json(ok({}, "Stock deleted."));
});

export const hospitalsList = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await getHospitalAndClinicUsers();
  const profiles = await ProfileModel.find({ userId: { $in: rows.map((row) => row.id) } }).lean();
  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));

  res.json(
    ok(
      rows.map((row) => ({
        id: row.id,
        hospital_name: profileByUserId.get(row.id)?.hospitalName || row.name,
      })),
    ),
  );
});

export const clinicsList = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await ClinicUserModel.find().sort({ name: 1 }).lean();
  const profiles = await ProfileModel.find({ userId: { $in: rows.map((row) => row.id) } }).lean();
  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));

  res.json(
    ok(
      rows.map((row) => ({
        id: row.id,
        clinic_name: profileByUserId.get(row.id)?.hospitalName || row.name,
      })),
    ),
  );
});

export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [donors, recipients, hospitals, clinics, totalCamps, stockAgg, pendingDonations, pendingRequests, fulfilledRequests] =
    await Promise.all([
      DonorUserModel.countDocuments(),
      RecipientUserModel.countDocuments(),
      HospitalUserModel.countDocuments(),
      ClinicUserModel.countDocuments(),
      CampModel.countDocuments(),
      BloodStockModel.aggregate([{ $group: { _id: null, totalUnits: { $sum: "$unitsAvailable" } } }]),
      RequestModel.countDocuments({ requestType: "donation", status: "pending" }),
      RequestModel.countDocuments({ requestType: "blood", status: "pending" }),
      RequestModel.countDocuments({ requestType: "blood", status: "approved" }),
    ]);

  res.json(
    ok({
      totalDonors: donors,
      totalRecipients: recipients,
      totalHospitals: hospitals + clinics,
      totalCamps,
      totalBloodUnits: stockAgg[0]?.totalUnits ?? 0,
      pendingDonations,
      pendingRequests,
      fulfilledRequests,
    }),
  );
});
