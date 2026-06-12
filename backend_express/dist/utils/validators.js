import { z } from 'zod';
export const GetProductsQuerySchema = z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z
        .enum(['price_asc', 'price_desc', 'created_at_asc', 'created_at_desc'])
        .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
//# sourceMappingURL=validators.js.map