import type { BloodRequest } from "../models/request";
import type { Notification } from "../models/notification";
import type { Profile } from "../models/profile";
import type { User } from "../models/user";
import { fromBloodGroupEnum } from "./blood-group";

export function mapUserForSession(user: User, profile?: Profile | null) {
  return {
    id: user.id,
    full_name: user.name,
    mobile: profile?.phone ?? "",
    email: user.email,
    role: user.role,
  };
}

export function mapProfile(user: User, profile?: Profile | null) {
  return {
    id: user.id,
    full_name: user.name,
    mobile: profile?.phone ?? "",
    email: user.email,
    role: user.role,
      is_active: true,
    is_verified: user.isVerified,
    date_joined: user.createdAt.toISOString(),
    profile: {
      address: profile?.address,
      blood_group: fromBloodGroupEnum(profile?.bloodGroup),
      date_of_birth: profile?.dateOfBirth?.toISOString().slice(0, 10) ?? null,
      hospital_name: profile?.hospitalName,
      registration_number: profile?.registrationNumber,
      city: profile?.city,
      state: profile?.state,
      pincode: profile?.pincode,
      contact_person: profile?.contactPerson,
    },
  };
}

export function mapRequestForDonationHistory(request: BloodRequest, requesterName: string) {
  return {
    id: request.id,
    donor_name: requesterName,
    blood_group: fromBloodGroupEnum(request.bloodGroup),
    status: request.status,
    requested_at: request.createdAt.toISOString(),
    admin_message: request.adminMessage,
  };
}

export function mapRequestForBloodHistory(
  request: BloodRequest,
  requesterName: string,
  requesterRole: "recipient" | "hospital" | "clinic",
) {
  return {
    id: request.id,
    requester_name: requesterName,
    requester_role: requesterRole,
    requester: request.requesterId,
    blood_group: fromBloodGroupEnum(request.bloodGroup),
    units_required: request.unitsRequired,
    status: request.status,
    requested_at: request.createdAt.toISOString(),
    admin_message: request.adminMessage,
  };
}

export function mapNotification(
  notification: Pick<Notification, "id" | "title" | "message" | "type" | "isRead" | "createdAt">,
) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    is_read: notification.isRead,
    created_at: notification.createdAt.toISOString(),
  };
}
