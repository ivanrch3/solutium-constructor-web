import { z } from 'zod';

export const assetSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(['pdf', 'excel', 'web']),
  name: z.string(),
  url: z.string().optional().nullable(),
  data: z.any().optional().nullable(),
  createdAt: z.string(),
});

export type Asset = z.infer<typeof assetSchema>;
