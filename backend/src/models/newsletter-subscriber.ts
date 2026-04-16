import mongoose, { Schema, type InferSchemaType } from "mongoose";

const newsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, default: null, trim: true },
    source: { type: String, default: "footer", trim: true },
  },
  { timestamps: true },
);

export type NewsletterSubscriber = InferSchemaType<typeof newsletterSubscriberSchema>;

export const NewsletterSubscriberModel =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);