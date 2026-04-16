import mongoose, { Schema, type InferSchemaType } from "mongoose";

const recipientUserSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, unique: true, sparse: true, trim: true, lowercase: true },
    password: { type: String, default: null },
    role: { type: String, default: "recipient", enum: ["recipient"], required: true },
    isVerified: { type: Boolean, default: false },
    bloodGroup: { type: String, default: null, enum: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"] },
    phone: { type: String, default: null, unique: true, sparse: true, trim: true },
    dateOfBirth: { type: Date, default: null },
    medicalCondition: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

export type RecipientUser = InferSchemaType<typeof recipientUserSchema>;

export const RecipientUserModel = mongoose.models.RecipientUser || mongoose.model("RecipientUser", recipientUserSchema);
