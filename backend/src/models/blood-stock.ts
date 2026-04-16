import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { bloodGroupValues } from "./domain";

const bloodStockSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    hospitalId: { type: Number, required: true, index: true },
    bloodGroup: { type: String, required: true, enum: bloodGroupValues, index: true },
    unitsAvailable: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export type BloodStock = InferSchemaType<typeof bloodStockSchema>;

export const BloodStockModel = mongoose.models.BloodStock || mongoose.model("BloodStock", bloodStockSchema);