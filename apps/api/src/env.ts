import { z } from 'zod';

export const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1).optional(),
    PORT: z.coerce.number().optional(),
    PUBLIC_FACILITIES_XLSX: z.string().min(1).optional(),
    KAKAO_REST_KEY: z.string().min(1).optional(),
  })
  .parse(process.env);
