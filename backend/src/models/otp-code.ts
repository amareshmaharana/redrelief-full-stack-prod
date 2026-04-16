import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { otpPurposeValues, roleValues } from "./domain";

const otpCodeSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    code: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, enum: otpPurposeValues },
    targetEmail: { type: String, default: null, trim: true, lowercase: true },
    targetPhone: { type: String, default: null, trim: true },
    role: { type: String, enum: roleValues, default: null },
    payloadJson: { type: Schema.Types.Mixed, default: null },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

otpCodeSchema.index({ targetEmail: 1, purpose: 1 });
otpCodeSchema.index({ targetPhone: 1, purpose: 1 });

export type OtpCode = InferSchemaType<typeof otpCodeSchema>;

export const OtpCodeModel = mongoose.models.OtpCode || mongoose.model("OtpCode", otpCodeSchema);