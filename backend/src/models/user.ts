import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { roleValues } from "./domain";

const userSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, unique: true, sparse: true, trim: true, lowercase: true },
    password: { type: String, default: null },
    role: { type: String, required: true, enum: roleValues },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);