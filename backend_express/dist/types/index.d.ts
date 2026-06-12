export type Category = 'tops' | 'dresses' | 'trousers' | 'outerwear';
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: Category;
    sizes: string[];
    colors: string[];
    image_url: string;
    stock_quantity: number;
    created_at: string;
    updated_at: string;
}
export interface CartSession {
    id: string;
    user_id: string | null;
    created_at: string;
    updated_at: string;
}
export interface CartItem {
    id: string;
    session_id: string;
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    price_at_time: number;
}
export interface Cart {
    id: string;
    items: CartItem[];
    total_price: number;
    created_at: string;
    updated_at: string;
}
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    price_at_purchase: number;
}
export interface Order {
    id: string;
    user_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_address: string;
    customer_phone?: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}
export interface NewsletterSubscriber {
    id: string;
    email: string;
    unsubscribed: boolean;
    created_at: string;
}
export interface ProductFilters {
    category?: string;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'created_at_asc' | 'created_at_desc';
    page?: number;
    limit?: number;
}
//# sourceMappingURL=index.d.ts.map