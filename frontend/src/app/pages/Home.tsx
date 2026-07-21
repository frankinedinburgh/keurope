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
            Authentic Korean Fashion<br />For The Discerning Woman
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Handpicked designer collections from Seoul, curated for European elegance
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 hover:bg-neutral-100 transition-colors font-medium"
          >
            Explore Collection
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
                Direct From Seoul To Your Wardrobe
              </h2>
              <p className="text-neutral-600 mb-6">
                K-Europe was founded by someone with deep roots in Korean fashion and a passion for European style.
                We work directly with independent Korean designers to bring you pieces that embody Seoul's
                minimalist elegance and impeccable craftsmanship.
              </p>
              <p className="text-neutral-600 mb-8">
                Every item in our collection is personally curated for women who value quality,
                timeless design, and the confidence that comes from wearing something truly special.
                We don't follow trends—we create them.
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
        <h2 className="text-3xl mb-12">Why K-Europe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl mb-4 font-medium">Authentic Korean Designers</h3>
            <p className="text-neutral-600">
              We partner directly with independent Korean fashion designers, bringing you pieces
              that haven't been mass-produced or diluted for commercial markets.
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-4 font-medium">Uncompromising Quality</h3>
            <p className="text-neutral-600">
              Premium fabrics, meticulous construction, and attention to detail that reflects
              Seoul's reputation for design excellence.
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-4 font-medium">Curated for You</h3>
            <p className="text-neutral-600">
              Every collection is thoughtfully selected for women who appreciate elegance,
              quality, and pieces that transcend seasonal trends.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
