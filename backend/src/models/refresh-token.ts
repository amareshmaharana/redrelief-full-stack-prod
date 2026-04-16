import mongoose, { Schema, type InferSchemaType } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    token: { type: String, required: true, unique: true, trim: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export type RefreshToken = InferSchemaType<typeof refreshTokenSchema>;

export const RefreshTokenModel = mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);