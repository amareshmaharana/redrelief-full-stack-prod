import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { bloodGroupValues } from "./domain";

const profileSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, unique: true, index: true },
    phone: { type: String, default: undefined, unique: true, sparse: true, trim: true },
    address: { type: String, default: null, trim: true },
    bloodGroup: { type: String, enum: bloodGroupValues, default: null },
    dateOfBirth: { type: Date, default: null },
    hospitalName: { type: String, default: null, trim: true },
    registrationNumber: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    pincode: { type: String, default: null, trim: true },
    contactPerson: { type: String, default: null, trim: true },
  },
  { timestamps: false },
);

export type Profile = InferSchemaType<typeof profileSchema>;

export const ProfileModel = mongoose.models.Profile || mongoose.model("Profile", profileSchema);