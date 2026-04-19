import type { BloodGroup } from "../models/domain";

const map: Record<string, BloodGroup> = {
  "A+": "A_POS",
  "A-": "A_NEG",
  "B+": "B_POS",
  "B-": "B_NEG",
  "AB+": "AB_POS",
  "AB-": "AB_NEG",
  "O+": "O_POS",
  "O-": "O_NEG",
};

const reverseMap: Record<BloodGroup, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export function toBloodGroupEnum(input?: string | null): BloodGroup | null {
  if (!input) {
    return null;
  }
  return map[input] ?? null;
}

export function fromBloodGroupEnum(input?: BloodGroup | null): string | null {
  if (!input) {
    return null;
  }
  return reverseMap[input] ?? null;
}
