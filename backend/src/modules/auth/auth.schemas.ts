import { z } from "zod";

const roleSchema = z.enum(["admin", "donor", "recipient", "hospital", "clinic"]);

function requiresPassword(role: z.infer<typeof roleSchema>) {
  return role === "admin" || role === "hospital" || role === "clinic";
}

export const registerSchema = z
  .object({
    full_name: z.string().min(2),
    mobile: z.string().min(6).optional(),
    email: z.string().email().optional().nullable(),
    password: z.string().min(8).optional(),
    role: roleSchema,
    blood_group: z.string().optional(),
    address: z.string().optional(),
    date_of_birth: z.string().optional(),
    hospital_name: z.string().optional(),
    registration_number: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    contact_person: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const hasEmail = Boolean(value.email && value.email.trim());
    const hasMobile = Boolean(value.mobile && value.mobile.trim());

    if (!hasEmail && !hasMobile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email or mobile is required.",
      });
    }

    if (requiresPassword(value.role) && !value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required for admin, hospital, and clinic.",
      });
    }

    if (value.role === "hospital" || value.role === "clinic") {
      if (!value.hospital_name || !value.hospital_name.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hospital_name"],
          message:
            value.role === "clinic"
              ? "Clinic name is required."
              : "Hospital name is required.",
        });
      }

      if (!value.registration_number || !value.registration_number.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registration_number"],
          message: "Registration number is required.",
        });
      }
    }
  });

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.email.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required.",
      });
    }
  });

export const sendOtpSchema = z.object({
  email: z.string().email().optional(),
  mobile: z.string().min(6).optional(),
  role: roleSchema.optional(),
  registration_payload: z.record(z.unknown()).optional(),
  purpose: z.enum(["register", "login", "password_reset"]).default("login"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().optional(),
  mobile: z.string().min(6).optional(),
  code: z.string().length(6),
  purpose: z.enum(["register", "login", "password_reset"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordResetSchema = z.object({
  token: z.string().min(20),
  new_password: z.string().min(8),
});

export const refreshTokenSchema = z.object({
  refresh: z.string().min(20),
});
