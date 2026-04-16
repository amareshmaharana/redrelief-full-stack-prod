import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminUserSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, unique: true, sparse: true, trim: true, lowercase: true },
    password: { type: String, default: null },
    role: { type: String, default: "admin", enum: ["admin"], required: true },
    isVerified: { type: Boolean, default: false },
    phone: { type: String, default: null, unique: true, sparse: true, trim: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type AdminUser = InferSchemaType<typeof adminUserSchema>;

export const AdminUserModel = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
