import mongoose, { Schema, type InferSchemaType } from "mongoose";

const campSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    campName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export type Camp = InferSchemaType<typeof campSchema>;

export const CampModel = mongoose.models.Camp || mongoose.model("Camp", campSchema);