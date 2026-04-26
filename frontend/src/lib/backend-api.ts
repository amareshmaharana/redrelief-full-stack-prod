import type { BloodGroup, BloodStock, UserRole } from "@/types";
import { apiRequest, extractList, getApiBaseUrl } from "@/lib/api-client";
import type { BackendUser } from "@/lib/auth-session";

export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

interface CampDTO {
  id: number;
  camp_name: string;
  location: string;
  date: string;
  description: string;
}

interface BloodStockDTO {
  id: number;
  blood_group: BloodGroup;
  units: number;
  expiry_date: string;
  created_at: string;
}

interface DonationRequestDTO {
  id: number;
  donor_name?: string;
  blood_group: BloodGroup;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  admin_message: string;
}

interface BloodRequestDTO {
  id: number;
  requester_name?: string;
  requester_role?: "recipient" | "hospital" | "clinic";
  blood_group: BloodGroup;
  units_required: number;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  admin_message: string;
  requester?: number;
}

export interface DashboardStatsDTO {
  totalDonors: number;
  totalRecipients: number;
  totalHospitals: number;
  totalCamps: number;
  totalBloodUnits: number;
  pendingDonations: number;
  pendingRequests: number;
  fulfilledRequests: number;
}

export interface UserProfileDTO {
  id: number;
  full_name: string;
  mobile: string;
  email?: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  profile?: Record<string, unknown>;
}

export interface StockSummaryDTO {
  blood_group: string;
  total_units: number;
}

export interface StockHealthDTO {
  available: number;
  low: number;
  expired: number;
  total_units: number;
  updated_at: string;
}

export interface AdminUserDTO extends BackendUser {
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
}

export const authApi = {
  register: (payload: Record<string, unknown>) =>
    apiRequest<{
      message: string;
      tokens: { access: string; refresh: string };
      user: BackendUser;
    }>("/api/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),

  login: (payload: Record<string, unknown>) =>
    apiRequest<{
      message: string;
      tokens: { access: string; refresh: string };
      user: BackendUser;
    }>("/api/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),

  checkEmailRole: (email: string) =>
    apiRequest<{ role: string; requiresPassword: boolean }>(
      "/api/check-email-role",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      },
    ),

  sendOtp: (payload: {
    mobile?: string;
    email?: string;
    purpose?: string;
    role?: string;
    registration_payload?: Record<string, unknown>;
  }) =>
    apiRequest<{ message: string }>("/api/send-otp", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),

  verifyOtp: (payload: {
    mobile?: string;
    email?: string;
    code: string;
    purpose: string;
  }) =>
    apiRequest<{
      message: string;
      tokens?: { access: string; refresh: string };
      user?: BackendUser;
    }>("/api/verify-otp", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),

  forgotPasswordRequest: (email: string) =>
    apiRequest<{ message: string }>("/api/forgot-password/request", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }),

  forgotPasswordReset: (payload: { token: string; new_password: string }) =>
    apiRequest<{ message: string }>("/api/forgot-password/reset", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),

  refreshToken: (refresh: string) =>
    apiRequest<{ access: string }>("/api/refresh-token", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ refresh }),
    }),
};

export const notificationApi = {
  list: async () => {
    const response = await apiRequest<unknown>("/api/notifications");
    return extractList<NotificationDTO>(response);
  },
  markRead: (notificationIds: number[]) =>
    apiRequest<{ message: string }>("/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ notification_ids: notificationIds }),
    }),
  markAllRead: () =>
    apiRequest<{ message: string }>("/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ mark_all: true }),
    }),
  socketBaseUrl: () => {
    return getApiBaseUrl();
  },
};

export const donorApi = {
  camps: async () => {
    const response = await apiRequest<unknown>("/api/donor/camps");
    return extractList<CampDTO>(response);
  },
  requests: async () => {
    const response = await apiRequest<unknown>("/api/donor/request-status");
    return extractList<DonationRequestDTO>(response);
  },
  createRequest: (formData: FormData) =>
    apiRequest<DonationRequestDTO>("/api/donor/donation-request", {
      method: "POST",
      body: formData,
    }),
};

export const recipientApi = {
  stock: async () => {
    const response = await apiRequest<unknown>("/api/recipient/stock");
    return extractList<BloodStockDTO>(response);
  },
  requests: async () => {
    const response = await apiRequest<unknown>("/api/recipient/request-status");
    return extractList<BloodRequestDTO>(response);
  },
  createRequest: (formData: FormData) =>
    apiRequest<BloodRequestDTO>("/api/recipient/blood-request", {
      method: "POST",
      body: formData,
    }),
};

export const hospitalApi = {
  stock: async () => {
    const response = await apiRequest<unknown>("/api/hospital/stock");
    return extractList<BloodStockDTO>(response);
  },
  addStock: (payload: {
    blood_group: string;
    units: number;
    expiry_date: string;
  }) =>
    apiRequest<BloodStockDTO>("/api/hospital/stock", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStock: (
    stockId: number,
    payload: { blood_group?: string; units?: number; expiry_date?: string },
  ) =>
    apiRequest<BloodStockDTO>(`/api/hospital/stock/${stockId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteStock: (stockId: number) =>
    apiRequest<{ message: string }>(`/api/hospital/stock/${stockId}`, {
      method: "DELETE",
    }),
  requests: async () => {
    const response = await apiRequest<unknown>("/api/hospital/request-status");
    return extractList<BloodRequestDTO>(response);
  },
  createRequest: (formData: FormData) =>
    apiRequest<BloodRequestDTO>("/api/hospital/blood-request", {
      method: "POST",
      body: formData,
    }),
};

export const clinicApi = {
  stock: async () => {
    const response = await apiRequest<unknown>("/api/clinic/stock");
    return extractList<BloodStockDTO>(response);
  },
  addStock: (payload: {
    blood_group: string;
    units: number;
    expiry_date: string;
  }) =>
    apiRequest<BloodStockDTO>("/api/clinic/stock", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStock: (
    stockId: number,
    payload: { blood_group?: string; units?: number; expiry_date?: string },
  ) =>
    apiRequest<BloodStockDTO>(`/api/clinic/stock/${stockId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteStock: (stockId: number) =>
    apiRequest<{ message: string }>(`/api/clinic/stock/${stockId}`, {
      method: "DELETE",
    }),
  requests: async () => {
    const response = await apiRequest<unknown>("/api/clinic/request-status");
    return extractList<BloodRequestDTO>(response);
  },
  createRequest: (formData: FormData) =>
    apiRequest<BloodRequestDTO>("/api/clinic/blood-request", {
      method: "POST",
      body: formData,
    }),
};

export const adminApi = {
  users: async (role?: UserRole) => {
    const response = await apiRequest<unknown>("/api/admin/users");
    const users = extractList<AdminUserDTO>(response);
    if (!role) {
      return users;
    }
    return users.filter((user) => user.role === role);
  },
  updateUserVerification: (userId: number, isVerified: boolean) =>
    apiRequest<{ message: string }>(`/api/admin/users/${userId}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ is_verified: isVerified }),
    }),
  deleteUser: (userId: number) =>
    apiRequest<{ message: string }>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
  camps: async () => {
    const response = await apiRequest<unknown>("/api/admin/camps");
    return extractList<CampDTO>(response);
  },
  createCamp: (payload: {
    camp_name: string;
    location: string;
    date: string;
    description: string;
  }) =>
    apiRequest<CampDTO>("/api/admin/camps", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCamp: (
    campId: number,
    payload: {
      camp_name?: string;
      location?: string;
      date?: string;
      description?: string;
    },
  ) =>
    apiRequest<CampDTO>(`/api/admin/camps/${campId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteCamp: (campId: number) =>
    apiRequest<{ message: string }>(`/api/admin/camps/${campId}`, {
      method: "DELETE",
    }),
  requests: () =>
    apiRequest<{
      donation_requests: DonationRequestDTO[];
      blood_requests: BloodRequestDTO[];
    }>("/api/admin/requests"),
  reviewDonationRequest: (
    requestId: number,
    status: "approved" | "rejected",
    adminMessage = "",
  ) =>
    apiRequest<{ message: string }>(
      `/api/admin/requests/donation/${requestId}/review`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, admin_message: adminMessage }),
      },
    ),
  reviewBloodRequest: (
    requestId: number,
    status: "approved" | "rejected",
    adminMessage = "",
  ) =>
    apiRequest<{ message: string }>(
      `/api/admin/requests/blood/${requestId}/review`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, admin_message: adminMessage }),
      },
    ),
  stock: async () => {
    const response = await apiRequest<unknown>("/api/admin/blood-stock");
    return extractList<BloodStockDTO>(response);
  },
  addStock: (payload: {
    blood_group: string;
    units: number;
    expiry_date: string;
  }) =>
    apiRequest<BloodStockDTO>("/api/admin/blood-stock", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStock: (
    stockId: number,
    payload: { blood_group?: string; units?: number; expiry_date?: string },
  ) =>
    apiRequest<BloodStockDTO>(`/api/admin/blood-stock/${stockId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteStock: (stockId: number) =>
    apiRequest<{ message: string }>(`/api/admin/blood-stock/${stockId}`, {
      method: "DELETE",
    }),
  hospitalsList: async () => {
    const response = await apiRequest<{ id: number; hospital_name: string }[]>(
      "/api/admin/hospitals-list",
    );
    return response;
  },
  clinicsList: async () => {
    const response = await apiRequest<{ id: number; clinic_name: string }[]>(
      "/api/admin/clinics-list",
    );
    return response;
  },
  dashboardStats: () =>
    apiRequest<DashboardStatsDTO>("/api/admin/dashboard-stats"),
};

export const profileApi = {
  get: () => apiRequest<UserProfileDTO>("/api/user/profile"),
  update: (payload: Record<string, unknown>) =>
    apiRequest<UserProfileDTO>("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  changePassword: (payload: {
    current_password: string;
    new_password: string;
  }) =>
    apiRequest<{ message: string }>("/api/user/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const publicApi = {
  subscribeNewsletter: (email: string) =>
    apiRequest<{ message: string }>("/api/public/subscribe", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    }),
  camps: async () => {
    const response = await apiRequest<unknown>("/api/public/camps", {
      auth: false,
    });
    return extractList<CampDTO>(response);
  },
  stockSummary: async () => {
    const response = await apiRequest<StockSummaryDTO[]>(
      "/api/public/stock-summary",
      { auth: false },
    );
    return response;
  },
  stockHealth: () =>
    apiRequest<StockHealthDTO>("/api/public/stock-health", { auth: false }),
};

function inferCampStatus(dateString: string) {
  const today = new Date();
  const target = new Date(dateString);
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const targetDate = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();
  if (targetDate > todayDate) {
    return "upcoming";
  }
  if (targetDate === todayDate) {
    return "ongoing";
  }
  return "completed";
}

export function mapCamp(dto: CampDTO) {
  const parts = dto.location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    id: String(dto.id),
    name: dto.camp_name,
    address: dto.location,
    city: parts[0] ?? "N/A",
    state: parts[1] ?? "N/A",
    date: dto.date,
    startTime: "09:00",
    endTime: "17:00",
    organizer: "JeevanBindu",
    contactPhone: "N/A",
    maxDonors: 200,
    registeredDonors: 0,
    status: inferCampStatus(dto.date) as "upcoming" | "ongoing" | "completed",
    description: dto.description ?? "",
  };
}

export function mapStock(dto: BloodStockDTO): BloodStock {
  const today = new Date();
  const expiry = new Date(dto.expiry_date);
  const expired =
    expiry < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return {
    id: String(dto.id),
    bloodGroup: dto.blood_group,
    units: dto.units,
    expiryDate: dto.expiry_date,
    collectedDate: dto.created_at?.split("T")[0] ?? dto.expiry_date,
    status: (expired ? "expired" : dto.units > 0 ? "available" : "reserved") as
      | "expired"
      | "available"
      | "reserved",
  };
}

export function mapDonationRequest(dto: DonationRequestDTO) {
  return {
    id: String(dto.id),
    donorName: dto.donor_name ?? "Donor",
    bloodGroup: dto.blood_group,
    requestDate: dto.requested_at?.split("T")[0] ?? "",
    status: dto.status,
    notes: dto.admin_message,
  };
}

export function mapBloodRequest(
  dto: BloodRequestDTO,
  requesterType: "recipient" | "hospital" | "clinic" = dto.requester_role ??
    "recipient",
) {
  return {
    id: String(dto.id),
    requesterName: dto.requester_name ?? "Requester",
    requesterType,
    bloodGroup: dto.blood_group,
    units: dto.units_required,
    urgency: "normal" as const,
    reason: dto.admin_message || "Awaiting review",
    requestDate: dto.requested_at?.split("T")[0] ?? "",
    status: dto.status,
  };
}
