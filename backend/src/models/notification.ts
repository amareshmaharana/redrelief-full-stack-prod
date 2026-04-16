import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { notificationTypeValues } from "./domain";

const notificationSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: notificationTypeValues, default: "info" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type Notification = InferSchemaType<typeof notificationSchema>;

export const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);