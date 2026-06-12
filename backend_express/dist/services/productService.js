import db from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';
// Example structure (you'll write this):
export async function getProducts(filters) {
    const category = filters.category || null;
    const search = filters.search ? `%${filters.search}%` : null;
    const sort = filters.sort || 'created_at_desc';
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }
        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(search, search);
        }
        // Build ORDER clause
        let orderClause = 'ORDER BY created_at DESC';
        if (sort === 'price_asc')
            orderClause = 'ORDER BY price ASC';
        if (sort === 'price_desc')
            orderClause = 'ORDER BY price DESC';
        if (sort === 'created_at_asc')
            orderClause = 'ORDER BY created_at ASC';
        // Get total count
        db.get(`SELECT COUNT(*) as total FROM products ${whereClause}`, params, (err, countRow) => {
            if (err) {
                reject(err);
                return;
            }
            const total = countRow.total;
            // Get paginated products
            db.all(`SELECT * FROM products ${whereClause} ${orderClause} LIMIT ? OFFSET ?`, [...params, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        items: rows,
                        pagination: {
                            page,
                            limit,
                            total,
                            totalPages: Math.ceil(total / limit),
                        },
                    });
                }
            });
        });
    });
}
export async function getProductById(id) {
    // Query single product
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products where id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (!row) {
                reject(new NotFoundError('Product'));
            }
            else {
                resolve(row);
            }
        });
    });
}
export async function getCategories() {
    // Get list of categories with counts
    return new Promise((resolve, reject) => {
        db.all(`SELECT category, COUNT(*) as count FROM products GROUP BY category`, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
//# sourceMappingURL=productService.js.map