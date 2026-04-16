import type { RequestStatus, RequestType, Role } from "../../models/domain";
import { NotificationModel } from "../../models/notification";
import { RequestModel } from "../../models/request";
import { UserModel } from "../../models/user";
import { DonorUserModel } from "../../models/donor-user";
import { RecipientUserModel } from "../../models/recipient-user";
import { HospitalUserModel } from "../../models/hospital-user";
import { ClinicUserModel } from "../../models/clinic-user";
import { AdminUserModel } from "../../models/admin-user";
import { getNextSequence } from "../../models/counter";
import { emitToUser } from "../../config/socket";
import { mapRequestForBloodHistory, mapRequestForDonationHistory } from "../../utils/serializers";
import { toBloodGroupEnum } from "../../utils/blood-group";
import { AppError } from "../../utils/app-error";

async function findUserById(userId: number) {
  return (
    (await DonorUserModel.findOne({ id: userId }).lean()) ||
    (await RecipientUserModel.findOne({ id: userId }).lean()) ||
    (await HospitalUserModel.findOne({ id: userId }).lean()) ||
    (await ClinicUserModel.findOne({ id: userId }).lean()) ||
    (await AdminUserModel.findOne({ id: userId }).lean()) ||
    (await UserModel.findOne({ id: userId }).lean())
  );
}

async function findUsersByIds(ids: number[]) {
  const [donors, recipients, hospitals, clinics, admins] = await Promise.all([
    DonorUserModel.find({ id: { $in: ids } }).lean(),
    RecipientUserModel.find({ id: { $in: ids } }).lean(),
    HospitalUserModel.find({ id: { $in: ids } }).lean(),
    ClinicUserModel.find({ id: { $in: ids } }).lean(),
    AdminUserModel.find({ id: { $in: ids } }).lean(),
    UserModel.find({ id: { $in: ids } }).lean(),
  ]);
  return [...donors, ...recipients, ...hospitals, ...clinics, ...admins];
}

async function createNotification(userId: number, title: string, message: string, type: "info" | "success" | "warning" | "error") {
  const notification = await NotificationModel.create({
    id: await getNextSequence("notifications"),
    userId,
    title,
    message,
    type,
  });

  emitToUser(userId, "notification:new", {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    is_read: notification.isRead,
    created_at: notification.createdAt.toISOString(),
  });
}

async function loadUsersByIds(ids: number[]) {
  const users = await findUsersByIds(ids);
  return new Map(users.map((user) => [user.id, user]));
}

export async function createDonationRequest(userId: number, input: { blood_group: string; camp?: string; admin_message?: string }) {
  const bloodGroup = toBloodGroupEnum(input.blood_group);
  if (!bloodGroup) {
    throw new AppError(400, "Invalid blood group.");
  }

  const requester = await findUserById(userId);
  if (!requester) {
    throw new AppError(404, "User not found.");
  }

  const created = await RequestModel.create({
    id: await getNextSequence("requests"),
    requesterId: userId,
    requestType: "donation" as RequestType,
    bloodGroup,
    unitsRequired: 1,
    campId: input.camp ? Number(input.camp) : null,
    adminMessage: input.admin_message ?? "",
  });

  return mapRequestForDonationHistory(created as never, requester.name);
}

export async function createBloodRequest(
  userId: number,
  role: Role,
  input: { blood_group: string; units_required: string; admin_message?: string },
) {
  const bloodGroup = toBloodGroupEnum(input.blood_group);
  if (!bloodGroup) {
    throw new AppError(400, "Invalid blood group.");
  }

  const units = Number(input.units_required || 1);
  if (Number.isNaN(units) || units < 1) {
    throw new AppError(400, "Units must be at least 1.");
  }

  const requester = await findUserById(userId);
  if (!requester) {
    throw new AppError(404, "User not found.");
  }

  const created = await RequestModel.create({
    id: await getNextSequence("requests"),
    requesterId: userId,
    requestType: "blood" as RequestType,
    bloodGroup,
    unitsRequired: units,
    adminMessage: input.admin_message ?? "",
  });

  return mapRequestForBloodHistory(created as never, requester.name, role as "recipient" | "hospital" | "clinic");
}

export async function listDonationRequestsForUser(userId: number) {
  const requester = await findUserById(userId);
  const data = await RequestModel.find({ requesterId: userId, requestType: "donation" as RequestType })
    .sort({ createdAt: -1 })
    .lean();

  return data.map((item) => mapRequestForDonationHistory(item as never, requester?.name ?? "Unknown"));
}

export async function listBloodRequestsForUser(userId: number, role: "recipient" | "hospital" | "clinic") {
  const requester = await findUserById(userId);
  const data = await RequestModel.find({ requesterId: userId, requestType: "blood" as RequestType })
    .sort({ createdAt: -1 })
    .lean();

  return data.map((item) => mapRequestForBloodHistory(item as never, requester?.name ?? "Unknown", role));
}

export async function listRequestsForAdmin() {
  const [donationRequests, bloodRequests] = await Promise.all([
    RequestModel.find({ requestType: "donation" as RequestType }).sort({ createdAt: -1 }).lean(),
    RequestModel.find({ requestType: "blood" as RequestType }).sort({ createdAt: -1 }).lean(),
  ]);

  const userById = await loadUsersByIds([...donationRequests, ...bloodRequests].map((item) => item.requesterId));

  return {
    donation_requests: donationRequests.map((item) => mapRequestForDonationHistory(item as never, userById.get(item.requesterId)?.name ?? "Unknown")),
    blood_requests: bloodRequests.map((item) =>
      mapRequestForBloodHistory(item as never, userById.get(item.requesterId)?.name ?? "Unknown", userById.get(item.requesterId)?.role as "recipient" | "hospital" | "clinic"),
    ),
  };
}

export async function reviewRequest(
  requestId: number,
  requestType: RequestType,
  status: RequestStatus,
  adminMessage = "",
) {
  const request = await RequestModel.findOne({ id: requestId, requestType }).lean();

  if (!request) {
    throw new AppError(404, "Request not found.");
  }

  await RequestModel.updateOne({ id: requestId }, { $set: { status, adminMessage } });

  await createNotification(
    request.requesterId,
    "Request Updated",
    `Your ${requestType} request #${requestId} has been ${status}.`,
    status === "approved" ? "success" : status === "rejected" ? "error" : "info",
  );

  return request;
}
