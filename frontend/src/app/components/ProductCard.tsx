import { Link } from 'react-router';
import { Product } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="aspect-[3/4] overflow-hidden bg-neutral-100 mb-4">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-neutral-600">{product.category}</p>
        <h3 className="group-hover:text-neutral-600 transition-colors">{product.title}</h3>
        <p className="text-sm">€{product.price}</p>
      </div>
    </Link>
  );
}
