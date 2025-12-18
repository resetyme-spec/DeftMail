import { z } from 'zod'

export const createDomainSchema = z.object({
  domain: z.string()
    .min(3, 'Domain must be at least 3 characters')
    .max(255, 'Domain must be less than 255 characters')
    .trim()
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
      'Invalid domain format'
    ),
})

export type CreateDomainInput = z.infer<typeof createDomainSchema>
