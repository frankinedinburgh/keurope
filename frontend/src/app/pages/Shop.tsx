import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../services/api';

const PRODUCTS_PER_PAGE = 12;

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Update selectedCategory when URL parameter changes
  useEffect(() => {
    setSelectedCategory(categoryParam || 'All');
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [categoryParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setAllProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(allProducts.map((p) => p.category)))];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return allProducts;
    }
    return allProducts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, allProducts]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayedCount);
  }, [filteredProducts, displayedCount]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && displayedCount < filteredProducts.length) {
          setIsLoadingMore(true);
          // Simulate network delay for smooth UX
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, filteredProducts.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [displayedCount, isLoadingMore, filteredProducts.length]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setDisplayedCount(PRODUCTS_PER_PAGE);
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl mb-2">Shop All</h1>
          <p className="text-sm md:text-base text-neutral-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          {/* Mobile Scrollable Tabs */}
          <div className="md:hidden -mx-4 px-4 mb-6">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-2 border transition-colors whitespace-nowrap text-sm ${
                      selectedCategory === category
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-neutral-300 hover:border-black'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Button Filters */}
          <div className="hidden md:flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 border transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-neutral-300 hover:border-black'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="mt-12 flex justify-center">
              {isLoadingMore && (
                <p className="text-neutral-600">Loading more products...</p>
              )}
              {displayedCount < filteredProducts.length && !isLoadingMore && (
                <p className="text-sm text-neutral-500">
                  Scroll down to load more ({displayedCount} of {filteredProducts.length})
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-neutral-600">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
