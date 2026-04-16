import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { bloodGroupValues, requestStatusValues, requestTypeValues } from "./domain";

const requestSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    requesterId: { type: Number, required: true, index: true },
    requestType: { type: String, required: true, enum: requestTypeValues },
    bloodGroup: { type: String, required: true, enum: bloodGroupValues },
    unitsRequired: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, enum: requestStatusValues, default: "pending" },
    hospitalId: { type: Number, default: null, index: true },
    campId: { type: Number, default: null, index: true },
    adminMessage: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export type BloodRequest = InferSchemaType<typeof requestSchema>;

export const RequestModel = mongoose.models.Request || mongoose.model("Request", requestSchema);