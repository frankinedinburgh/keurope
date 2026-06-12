import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../services/api';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setFeaturedProducts(data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured products:', err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-neutral-100">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1778757367899-db7c77e78b09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzdHJlZXQlMjBmYXNoaW9uJTIwd29tYW58ZW58MXx8fHwxNzgwNTkxMzYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Hero"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl mb-6 tracking-tight">
            Korean Fashion,<br />European Spirit
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Discover curated collections from Seoul's finest designers
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 hover:bg-neutral-100 transition-colors"
          >
            Shop Collection
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2">Featured Collection</h2>
            <p className="text-neutral-600">Handpicked styles for the modern woman</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-2 text-sm hover:text-neutral-600 transition-colors"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm hover:text-neutral-600 transition-colors"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">
                Where Seoul Meets Europe
              </h2>
              <p className="text-neutral-600 mb-6">
                Based in Ireland with deep connections to Korean fashion designers, 
                keurope brings you the best of contemporary Korean fashion. Each piece 
                is carefully selected to blend Seoul's innovative design philosophy 
                with European sensibility.
              </p>
              <p className="text-neutral-600 mb-8">
                We believe in quality over quantity, timeless style over fleeting trends, 
                and the power of fashion to connect cultures.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border-b border-black pb-1 hover:text-neutral-600 transition-colors"
              >
                Learn More About Us
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="aspect-[4/5] bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZmFzaGlvbiUyMG91dGZpdCUyMHdvbWFufGVufDF8fHx8MTc4MDU5MTM2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="About keurope"
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl mb-4">Premium Quality</h3>
            <p className="text-neutral-600">
              Every piece is crafted from the finest materials, ensuring longevity and comfort.
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-4">Direct From Designers</h3>
            <p className="text-neutral-600">
              Our connections in Korea mean you get authentic designs straight from Seoul's studios.
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-4">European Delivery</h3>
            <p className="text-neutral-600">
              Fast, reliable shipping across Europe from our Irish base.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
