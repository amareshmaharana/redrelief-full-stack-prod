import mongoose, { Schema, type InferSchemaType } from "mongoose";

const hospitalUserSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, unique: true, sparse: true, trim: true, lowercase: true },
    password: { type: String, default: null },
    role: { type: String, default: "hospital", enum: ["hospital"], required: true },
    isVerified: { type: Boolean, default: false },
    hospitalName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, default: null, unique: true, sparse: true, trim: true },
    address: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    pincode: { type: String, default: null, trim: true },
    contactPerson: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

export type HospitalUser = InferSchemaType<typeof hospitalUserSchema>;

export const HospitalUserModel = mongoose.models.HospitalUser || mongoose.model("HospitalUser", hospitalUserSchema);
