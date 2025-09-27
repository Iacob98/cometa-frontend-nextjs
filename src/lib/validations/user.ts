import { z } from "zod";

// Predefined skills for fiber optic construction workers
export const PREDEFINED_SKILLS = [
  "Fiber Optic Cable Installation",
  "Fiber Optic Splicing",
  "Cable Pulling",
  "Trenching & Excavation",
  "Underground Construction",
  "Aerial Construction",
  "OSP (Outside Plant) Installation",
  "Fiber Optic Testing (OTDR)",
  "Cable Locating",
  "Traffic Control",
  "Confined Space Entry",
  "Heavy Equipment Operation",
  "Directional Drilling",
  "Manholes & Handholes",
  "Pole Installation",
  "Conduit Installation",
  "Fusion Splicing",
  "Mechanical Splicing",
  "Cable Maintenance",
  "Network Documentation",
  "Safety Compliance",
  "First Aid/CPR",
  "German Language",
  "Russian Language",
  "English Language",
  "Project Management",
  "Team Leadership"
] as const;

// User roles
export const USER_ROLES = [
  "admin",
  "pm", // project manager
  "foreman",
  "crew", // field worker
  "viewer"
] as const;

// Create user form schema
export const createUserSchema = z.object({
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  role: z
    .enum(USER_ROLES, {
      required_error: "Please select a role",
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Phone number must be at least 10 digits",
    }),
  pin_code: z
    .string()
    .optional()
    .refine((val) => !val || (val.length >= 4 && val.length <= 6 && /^\d+$/.test(val)), {
      message: "PIN code must be 4-6 digits",
    }),
  skills: z
    .array(z.string())
    .default([])
    .optional(),
  lang_pref: z
    .enum(["en", "de", "ru", "uz", "tr"])
    .default("de")
    .optional(),
}).refine((data) => {
  // Either email or phone must be provided
  return data.email || data.phone;
}, {
  message: "Either email or phone number is required",
  path: ["email"], // This will show the error on the email field
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Response type from API
export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  lang_pref?: string;
  skills?: string[];
}

// Skills response from API
export interface SkillsResponse {
  predefined_skills: string[];
  message: string;
}