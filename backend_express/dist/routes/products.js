import { Router } from 'express';
import { listProducts, getProduct, getCategoriesList, } from '../controllers/productController.js';
const router = Router();
// GET /api/products/categories (MUST come before /:id - more specific routes first!)
router.get('/categories', getCategoriesList);
// GET /api/products/:id
router.get('/:id', getProduct);
// GET /api/products?category=dresses&sort=price_asc (catches all other GET requests)
router.get('/', listProducts);
export default router;
//# sourceMappingURL=products.js.map