export const roleValues = ["admin", "donor", "recipient", "hospital", "clinic"] as const;
export type Role = (typeof roleValues)[number];

export const bloodGroupValues = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"] as const;
export type BloodGroup = (typeof bloodGroupValues)[number];

export const requestStatusValues = ["pending", "approved", "rejected"] as const;
export type RequestStatus = (typeof requestStatusValues)[number];

export const requestTypeValues = ["donation", "blood"] as const;
export type RequestType = (typeof requestTypeValues)[number];

export const notificationTypeValues = ["info", "success", "warning", "error"] as const;
export type NotificationType = (typeof notificationTypeValues)[number];

export const otpPurposeValues = ["register", "login", "password_reset"] as const;
export type OtpPurpose = (typeof otpPurposeValues)[number];