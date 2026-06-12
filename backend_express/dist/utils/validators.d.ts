import { z } from 'zod';
export declare const GetProductsQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<["price_asc", "price_desc", "created_at_asc", "created_at_desc"]>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    category?: string | undefined;
    search?: string | undefined;
    sort?: "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc" | undefined;
}, {
    category?: string | undefined;
    search?: string | undefined;
    sort?: "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
//# sourceMappingURL=validators.d.ts.map