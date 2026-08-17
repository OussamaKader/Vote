import { z } from "zod";

const whatsappRegex = /^(\+212[567]\d{8}|\+222\d{8})$/;

export function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("212") || digits.startsWith("222")) {
    return `+${digits}`;
  }

  return `+212${digits.replace(/^0+/, "")}`;
}

export const whatsappSchema = z
  .string()
  .trim()
  .refine((value) => value.length > 0, "Le numéro WhatsApp est obligatoire.")
  .refine((value) => whatsappRegex.test(value), "Le format du numéro WhatsApp est invalide. Exemple : +2126XXXXXXXX (Maroc) ou +222XXXXXXXX (Mauritanie)");

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Le nom complet est requis."),
    whatsapp_number: whatsappSchema,
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string().min(8, "La confirmation est obligatoire."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })
  .refine((data) => /[A-Z]/.test(data.password) && /\d/.test(data.password), {
    message: "Le mot de passe doit contenir au moins une majuscule et un chiffre.",
    path: ["password"],
  });

export const loginSchema = z.object({
  whatsapp_number: whatsappSchema,
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
