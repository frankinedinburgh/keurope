import { getProducts, getProductById, getCategories } from '../services/productService.js';
import { GetProductsQuerySchema } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
export async function listProducts(req, res) {
    try {
        // Validate query params
        const parsed = GetProductsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            throw new ValidationError('Invalid query parameters', parsed.error.flatten().fieldErrors);
        }
        // Call service
        const result = await getProducts(parsed.data);
        // Return response
        res.json({
            status: 'success',
            data: result,
        });
    }
    catch (err) {
        console.error('listProducts error:', err);
        if (err instanceof ValidationError) {
            res.status(400).json({
                status: 'error',
                error: { code: err.code, message: err.message, details: err.details },
            });
        }
        else {
            res.status(500).json({
                status: 'error',
                error: { code: 'SERVER_ERROR', message: 'Internal server error' },
            });
        }
    }
}
export async function getProduct(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('Product ID is required');
        }
        const product = await getProductById(id);
        res.json({
            status: 'success',
            data: product,
        });
    }
    catch (err) {
        if (err instanceof NotFoundError) {
            res.status(404).json({
                status: 'error',
                error: { code: err.code, message: err.message },
            });
        }
        else {
            res.status(500).json({
                status: 'error',
                error: { code: 'SERVER_ERROR', message: 'Internal server error' },
            });
        }
    }
}
export async function getCategoriesList(_req, res) {
    try {
        const categories = await getCategories();
        res.json({
            status: 'success',
            data: categories,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
}
//# sourceMappingURL=productController.js.map