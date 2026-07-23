import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 mb-4 md:mb-0">
            <h3 className="text-lg md:text-xl mb-2 md:mb-4">keurope</h3>
            <p className="text-xs md:text-sm text-neutral-600 max-w-md">
              Bridging Korean fashion innovation with European elegance. Curated collections from Seoul's finest designers, delivered to your door.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm md:text-base font-medium mb-3 md:mb-4">Shop</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-neutral-600">
              <li>
                <Link to="/shop" className="hover:text-black transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Outerwear" className="hover:text-black transition-colors">
                  Outerwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Tops" className="hover:text-black transition-colors">
                  Tops
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Bottoms" className="hover:text-black transition-colors">
                  Bottoms
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm md:text-base font-medium mb-3 md:mb-4">Company</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-neutral-600">
              <li>
                <Link to="/about" className="hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-black transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-black transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-black transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t text-center text-xs md:text-sm text-neutral-600">
          <p>&copy; {new Date().getFullYear()} keurope. Based in Ireland, inspired by Korea.</p>
        </div>
      </div>
    </footer>
  );
}
