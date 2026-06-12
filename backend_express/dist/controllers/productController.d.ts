import { Request, Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '../types/api.js';
import type { Product } from '../types/index.js';
export declare function listProducts(req: Request, res: Response<ApiResponse<PaginatedResponse<Product>>>): Promise<void>;
export declare function getProduct(req: Request, res: Response<ApiResponse<Product>>): Promise<void>;
export declare function getCategoriesList(_req: Request, res: Response<ApiResponse<any[]>>): Promise<void>;
//# sourceMappingURL=productController.d.ts.map