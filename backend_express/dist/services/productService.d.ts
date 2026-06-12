import type { Product, ProductFilters } from '../types/index.js';
export declare function getProducts(filters: ProductFilters): Promise<{
    items: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getProductById(id: string): Promise<Product>;
export declare function getCategories(): Promise<Product[]>;
//# sourceMappingURL=productService.d.ts.map