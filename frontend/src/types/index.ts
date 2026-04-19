export type UserRole = 'admin' | 'donor' | 'recipient' | 'hospital' | 'clinic';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';
export type DonationStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Donor extends User {
  bloodGroup: BloodGroup;
  age: number;
  gender: Gender;
  address: string;
  lastDonation?: string;
  totalDonations: number;
  medicalReport?: string;
  isEligible: boolean;
}

export interface Recipient extends User {
  bloodGroup: BloodGroup;
  age: number;
  gender: Gender;
  address: string;
  idProof?: string;
  medicalReport?: string;
}

export interface Hospital extends User {
  hospitalName: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
}

export interface BloodCamp {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  contactPhone: string;
  maxDonors: number;
  registeredDonors: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
}

export interface BloodStock {
  id: string;
  bloodGroup: BloodGroup;
  units: number;
  expiryDate: string;
  collectedDate: string;
  campId?: string;
  donorId?: string;
  status: 'available' | 'reserved' | 'expired' | 'used';
}

export interface DonationRequest {
  id: string;
  donorId?: string;
  donorName: string;
  bloodGroup: BloodGroup;
  campId?: string;
  campName?: string;
  requestDate: string;
  status: DonationStatus;
  medicalReport?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface BloodRequest {
  id: string;
  requesterId?: string;
  requesterName: string;
  requesterType: 'recipient' | 'hospital' | 'clinic';
  bloodGroup: BloodGroup;
  units: number;
  urgency: 'normal' | 'urgent' | 'critical';
  reason: string;
  requestDate: string;
  status: RequestStatus;
  idProof?: string;
  medicalReport?: string;
  rejectionReason?: string;
}

export interface DashboardStats {
  totalDonors: number;
  totalRecipients: number;
  totalHospitals: number;
  totalCamps: number;
  totalBloodUnits: number;
  pendingDonations: number;
  pendingRequests: number;
  fulfilledRequests: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
