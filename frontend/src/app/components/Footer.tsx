import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl mb-4">keurope</h3>
            <p className="text-sm text-neutral-600 max-w-md">
              Bridging Korean fashion innovation with European elegance. 
              Curated collections from Seoul's finest designers, delivered to your door.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
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
            <h4 className="mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link to="/about" className="hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-neutral-600">
          <p>&copy; {new Date().getFullYear()} keurope. Based in Ireland, inspired by Korea.</p>
        </div>
      </div>
    </footer>
  );
}
