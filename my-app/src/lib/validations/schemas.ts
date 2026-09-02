import { z } from 'zod'
 
// Sri Lanka districts list
export const SL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Hambantota', 'Matara', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
] as const
 
// ── Register schema ────────────────────────────────
export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['farmer', 'retailer']),
  // Fixed the regex here by escaping the plus sign: \+
  phone: z.string().regex(/^\+94[0-9]{9}$/, 'Phone must be +94XXXXXXXXX format'),
  district: z.enum(SL_DISTRICTS, {
    message: 'Select a valid district',
  }),
})
 
// ── Harvest listing schema ─────────────────────────
export const listingSchema = z.object({
  crop_name: z.string().min(2, 'Enter the crop name'),
  quantity_kg: z.number().positive('Quantity must be greater than 0'),
  base_price_lkr: z.number().positive('Price must be greater than 0'),
  moq_kg: z.number().positive('MOQ must be greater than 0'),
  available_from: z.string().min(1, 'Select a harvest date'),
  available_until: z.string().min(1, 'Select an expiry date'),
  description: z.string().optional(),
}).refine(data => data.moq_kg <= data.quantity_kg, {
  message: 'MOQ cannot be more than total quantity',
  path: ['moq_kg'],
})
 
// ── Login schema ───────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ── Profile schema ─────────────────────────────────
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+94[0-9]{9}$/, 'Phone must be +94XXXXXXXXX format'),
  district: z.enum(SL_DISTRICTS, { message: 'Select a valid district' }),
  farm_name: z.string().min(2, 'Farm name must be at least 2 characters').optional(),
})

export type RegisterSchema = z.infer<typeof registerSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type ListingSchema = z.infer<typeof listingSchema>
export type ProfileSchema = z.infer<typeof profileSchema>