import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export const USER_ROLES = ["admin", "donor", "recipient", "hospital", "clinic"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const REQUEST_STATUSES = ["pending", "approved", "rejected", "fulfilled", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const CAMPAIGN_STATUSES = ["draft", "scheduled", "active", "completed", "cancelled"] as const;
export type CampStatus = (typeof CAMPAIGN_STATUSES)[number];

export const NOTIFICATION_TYPES = ["info", "success", "warning", "error"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const CONTACT_STATUSES = ["new", "in_progress", "resolved", "closed"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export interface UserAttrs {
  email: string | null;
  mobile: string | null;
  passwordHash: string | null;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdBy?: Types.ObjectId | null;
}

export type UserDocument = HydratedDocument<UserAttrs>;

export interface ProfileAttrs {
  user: Types.ObjectId;
  role: UserRole;
  fullName: string;
  phone: string | null;
  bloodGroup: BloodGroup | null;
  dateOfBirth: Date | null;
  gender: "male" | "female" | "other" | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  avatarUrl: string | null;
  emergencyContact: string | null;
  donor: {
    occupation: string | null;
    lastDonationAt: Date | null;
    eligibleFrom: Date | null;
  } | null;
  recipient: {
    hospitalName: string | null;
    diagnosis: string | null;
  } | null;
  organization: {
    organizationName: string | null;
    registrationNumber: string | null;
    contactPerson: string | null;
    designation: string | null;
    licenseNumber: string | null;
  } | null;
}

export type ProfileDocument = HydratedDocument<ProfileAttrs>;

export interface RefreshTokenAttrs {
  user: Types.ObjectId;
  tokenHash: string;
  jti: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenHash: string | null;
  userAgent: string | null;
  ipAddress: string | null;
}

export type RefreshTokenDocument = HydratedDocument<RefreshTokenAttrs>;

export interface CampAttrs {
  title: string;
  slug: string;
  description: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  coordinates: {
    lat: number | null;
    lng: number | null;
  } | null;
  startAt: Date;
  endAt: Date;
  status: CampStatus;
  isPublic: boolean;
  createdBy: Types.ObjectId;
  approvedBy: Types.ObjectId | null;
  allowedRoles: UserRole[];
  slots: number;
  bookedSlots: number;
  contactPhone: string | null;
  contactEmail: string | null;
}

export type CampDocument = HydratedDocument<CampAttrs>;

export interface BloodStockAttrs {
  facility: Types.ObjectId;
  facilityRole: "hospital" | "clinic";
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  unitsReserved: number;
  unitsExpired: number;
  thresholdLow: number;
  batchNumber: string | null;
  collectedAt: Date | null;
  expiryAt: Date;
  sourceDonation: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  notes: string | null;
}

export type BloodStockDocument = HydratedDocument<BloodStockAttrs>;

export interface BloodRequestAttrs {
  requester: Types.ObjectId;
  requesterRole: "recipient" | "hospital" | "clinic";
  bloodGroup: BloodGroup;
  unitsRequired: number;
  priority: "low" | "normal" | "high" | "critical";
  status: RequestStatus;
  neededBy: Date | null;
  reason: string;
  attachmentUrl: string | null;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  adminMessage: string | null;
  fulfilledByDonation: Types.ObjectId | null;
  fulfilledAt: Date | null;
  camp: Types.ObjectId | null;
}

export type BloodRequestDocument = HydratedDocument<BloodRequestAttrs>;

export interface DonationRequestAttrs {
  donor: Types.ObjectId;
  bloodGroup: BloodGroup;
  preferredCamp: Types.ObjectId | null;
  preferredDate: Date | null;
  status: RequestStatus;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  adminMessage: string | null;
  screeningNotes: string | null;
  completedDonation: Types.ObjectId | null;
}

export type DonationRequestDocument = HydratedDocument<DonationRequestAttrs>;

export interface DonationAttrs {
  donor: Types.ObjectId;
  donationRequest: Types.ObjectId | null;
  camp: Types.ObjectId | null;
  bloodGroup: BloodGroup;
  unitsCollected: number;
  donatedAt: Date;
  screeningStatus: "passed" | "failed" | "deferred";
  screenedBy: Types.ObjectId | null;
  recordedBy: Types.ObjectId;
  notes: string | null;
}

export type DonationDocument = HydratedDocument<DonationAttrs>;

export interface NotificationAttrs {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: Date | null;
  delivery: {
    inApp: boolean;
    websocket: boolean;
    email: boolean;
  };
  sourceCollection: "BloodRequest" | "DonationRequest" | "Donation" | "Camp" | "AdminLog" | "System";
  sourceId: Types.ObjectId | null;
  payload: Record<string, unknown>;
}

export type NotificationDocument = HydratedDocument<NotificationAttrs>;

export interface AdminLogAttrs {
  actor: Types.ObjectId;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: Types.ObjectId | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
}

export type AdminLogDocument = HydratedDocument<AdminLogAttrs>;

export interface ContactMessageAttrs {
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  assignedTo: Types.ObjectId | null;
  repliedAt: Date | null;
  replyMessage: string | null;
  source: "website" | "mobile" | "admin";
}

export type ContactMessageDocument = HydratedDocument<ContactMessageAttrs>;

const objectId = Schema.Types.ObjectId;

const coordinateSchema = new Schema(
  {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false },
);

const donorProfileSchema = new Schema(
  {
    occupation: { type: String, default: null, trim: true },
    lastDonationAt: { type: Date, default: null },
    eligibleFrom: { type: Date, default: null },
  },
  { _id: false },
);

const recipientProfileSchema = new Schema(
  {
    hospitalName: { type: String, default: null, trim: true },
    diagnosis: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const organizationProfileSchema = new Schema(
  {
    organizationName: { type: String, default: null, trim: true },
    registrationNumber: { type: String, default: null, trim: true },
    contactPerson: { type: String, default: null, trim: true },
    designation: { type: String, default: null, trim: true },
    licenseNumber: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const userSchema = new Schema<UserAttrs>(
  {
    email: { type: String, trim: true, lowercase: true, default: null },
    mobile: { type: String, trim: true, default: null },
    passwordHash: { type: String, default: null, select: false },
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    createdBy: { type: objectId, ref: "User", default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

const profileSchema = new Schema<ProfileAttrs>(
  {
    user: { type: objectId, ref: "User", required: true, unique: true },
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: null },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: null, index: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    address: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    pincode: { type: String, default: null, trim: true },
    avatarUrl: { type: String, default: null, trim: true },
    emergencyContact: { type: String, default: null, trim: true },
    donor: { type: donorProfileSchema, default: null },
    recipient: { type: recipientProfileSchema, default: null },
    organization: { type: organizationProfileSchema, default: null },
  },
  { timestamps: true },
);

profileSchema.index({ phone: 1 }, { unique: true, sparse: true });
profileSchema.index({ role: 1 });
profileSchema.index({ bloodGroup: 1 });

const refreshTokenSchema = new Schema<RefreshTokenAttrs>(
  {
    user: { type: objectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ user: 1, expiresAt: 1 });

const campSchema = new Schema<CampAttrs>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    locationName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true, index: true },
    pincode: { type: String, default: null, trim: true },
    coordinates: { type: coordinateSchema, default: null },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    status: { type: String, enum: CAMPAIGN_STATUSES, default: "draft", index: true },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: "User", required: true, index: true },
    approvedBy: { type: objectId, ref: "User", default: null },
    allowedRoles: { type: [String], enum: USER_ROLES, default: ["donor", "recipient", "hospital", "clinic"] },
    slots: { type: Number, required: true, min: 0, default: 0 },
    bookedSlots: { type: Number, required: true, min: 0, default: 0 },
    contactPhone: { type: String, default: null, trim: true },
    contactEmail: { type: String, default: null, trim: true, lowercase: true },
  },
  { timestamps: true },
);

campSchema.index({ isPublic: 1, status: 1, startAt: 1 });
campSchema.index({ city: 1, state: 1 });

const bloodStockSchema = new Schema<BloodStockAttrs>(
  {
    facility: { type: objectId, ref: "User", required: true, index: true },
    facilityRole: { type: String, enum: ["hospital", "clinic"], required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    unitsAvailable: { type: Number, required: true, min: 0, default: 0 },
    unitsReserved: { type: Number, required: true, min: 0, default: 0 },
    unitsExpired: { type: Number, required: true, min: 0, default: 0 },
    thresholdLow: { type: Number, required: true, min: 0, default: 10 },
    batchNumber: { type: String, default: null, trim: true },
    collectedAt: { type: Date, default: null },
    expiryAt: { type: Date, required: true, index: true },
    sourceDonation: { type: objectId, ref: "Donation", default: null },
    updatedBy: { type: objectId, ref: "User", default: null },
    notes: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

bloodStockSchema.index({ facility: 1, bloodGroup: 1, expiryAt: 1 });
bloodStockSchema.index({ bloodGroup: 1, unitsAvailable: 1 });

const bloodRequestSchema = new Schema<BloodRequestAttrs>(
  {
    requester: { type: objectId, ref: "User", required: true, index: true },
    requesterRole: { type: String, enum: ["recipient", "hospital", "clinic"], required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    unitsRequired: { type: Number, required: true, min: 1 },
    priority: { type: String, enum: ["low", "normal", "high", "critical"], default: "normal", index: true },
    status: { type: String, enum: REQUEST_STATUSES, default: "pending", index: true },
    neededBy: { type: Date, default: null },
    reason: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, default: null, trim: true },
    reviewedBy: { type: objectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    adminMessage: { type: String, default: null, trim: true },
    fulfilledByDonation: { type: objectId, ref: "Donation", default: null },
    fulfilledAt: { type: Date, default: null },
    camp: { type: objectId, ref: "Camp", default: null },
  },
  { timestamps: true },
);

bloodRequestSchema.index({ requester: 1, status: 1, createdAt: -1 });
bloodRequestSchema.index({ bloodGroup: 1, status: 1, priority: 1 });

const donationRequestSchema = new Schema<DonationRequestAttrs>(
  {
    donor: { type: objectId, ref: "User", required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    preferredCamp: { type: objectId, ref: "Camp", default: null },
    preferredDate: { type: Date, default: null },
    status: { type: String, enum: REQUEST_STATUSES, default: "pending", index: true },
    reviewedBy: { type: objectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    adminMessage: { type: String, default: null, trim: true },
    screeningNotes: { type: String, default: null, trim: true },
    completedDonation: { type: objectId, ref: "Donation", default: null },
  },
  { timestamps: true },
);

donationRequestSchema.index({ donor: 1, status: 1, createdAt: -1 });
donationRequestSchema.index({ bloodGroup: 1, status: 1 });

const donationSchema = new Schema<DonationAttrs>(
  {
    donor: { type: objectId, ref: "User", required: true, index: true },
    donationRequest: { type: objectId, ref: "DonationRequest", default: null },
    camp: { type: objectId, ref: "Camp", default: null },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    unitsCollected: { type: Number, required: true, min: 1 },
    donatedAt: { type: Date, required: true, index: true },
    screeningStatus: { type: String, enum: ["passed", "failed", "deferred"], default: "passed", index: true },
    screenedBy: { type: objectId, ref: "User", default: null },
    recordedBy: { type: objectId, ref: "User", required: true },
    notes: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

donationSchema.index({ donor: 1, donatedAt: -1 });
donationSchema.index({ bloodGroup: 1, donatedAt: -1 });

const notificationSchema = new Schema<NotificationAttrs>(
  {
    user: { type: objectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "info", index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    delivery: {
      inApp: { type: Boolean, default: true },
      websocket: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
    sourceCollection: {
      type: String,
      enum: ["BloodRequest", "DonationRequest", "Donation", "Camp", "AdminLog", "System"],
      default: "System",
      index: true,
    },
    sourceId: { type: objectId, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const adminLogSchema = new Schema<AdminLogAttrs>(
  {
    actor: { type: objectId, ref: "User", required: true, index: true },
    actorRole: { type: String, enum: USER_ROLES, required: true, index: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: objectId, default: null, index: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: null, trim: true },
    userAgent: { type: String, default: null, trim: true },
    notes: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

adminLogSchema.index({ actor: 1, createdAt: -1 });
adminLogSchema.index({ entityType: 1, entityId: 1 });

const contactMessageSchema = new Schema<ContactMessageAttrs>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: null, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: CONTACT_STATUSES, default: "new", index: true },
    assignedTo: { type: objectId, ref: "User", default: null },
    repliedAt: { type: Date, default: null },
    replyMessage: { type: String, default: null, trim: true },
    source: { type: String, enum: ["website", "mobile", "admin"], default: "website", index: true },
  },
  { timestamps: true },
);

contactMessageSchema.index({ email: 1, createdAt: -1 });

export const UserModel = model<UserAttrs>("User", userSchema);
export const ProfileModel = model<ProfileAttrs>("Profile", profileSchema);
export const RefreshTokenModel = model<RefreshTokenAttrs>("RefreshToken", refreshTokenSchema);
export const CampModel = model<CampAttrs>("Camp", campSchema);
export const BloodStockModel = model<BloodStockAttrs>("BloodStock", bloodStockSchema);
export const BloodRequestModel = model<BloodRequestAttrs>("BloodRequest", bloodRequestSchema);
export const DonationRequestModel = model<DonationRequestAttrs>("DonationRequest", donationRequestSchema);
export const DonationModel = model<DonationAttrs>("Donation", donationSchema);
export const NotificationModel = model<NotificationAttrs>("Notification", notificationSchema);
export const AdminLogModel = model<AdminLogAttrs>("AdminLog", adminLogSchema);
export const ContactMessageModel = model<ContactMessageAttrs>("ContactMessage", contactMessageSchema);