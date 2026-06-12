import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-6xl mb-6">
          Bridging Two Worlds
        </h1>
        <p className="text-lg text-neutral-600">
          Where Korean fashion innovation meets European elegance
        </p>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] bg-neutral-100">
            <img
              src="https://images.unsplash.com/photo-1767977005045-94eb8d80b833?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzdHlsZSUyMGRyZXNzJTIwZWxlZ2FudHxlbnwxfHx8fDE3ODA1OTEzNjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Korean fashion"
              className="size-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl mb-6">Our Story</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                keurope was born from a simple observation: Korean fashion's innovative 
                designs and quality craftsmanship deserved a dedicated platform in Europe.
              </p>
              <p>
                Based in Ireland with deep ties to Seoul's fashion community, we curate 
                collections that blend the best of both worlds. Each piece is selected 
                for its quality, design, and ability to transcend cultural boundaries.
              </p>
              <p>
                Our founder, with Korean heritage and European upbringing, saw an 
                opportunity to share the sophisticated minimalism and contemporary 
                aesthetics of Korean fashion with European fashion enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl mb-12 text-center">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl mb-4">Quality First</h3>
              <p className="text-neutral-600">
                We partner only with Korean designers who share our commitment to 
                exceptional materials and craftsmanship. Every piece is built to last.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl mb-4">Cultural Bridge</h3>
              <p className="text-neutral-600">
                Fashion is a universal language. We celebrate the unique perspectives 
                of Korean design while making it accessible to European sensibilities.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl mb-4">Sustainable Approach</h3>
              <p className="text-neutral-600">
                We believe in timeless style over fast fashion. Our pieces are designed 
                to be cherished for years, not seasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Designer Connections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl mb-6">Direct From Seoul</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                Our connections in Korea's fashion industry run deep. We work directly 
                with emerging and established designers in Seoul, ensuring authenticity 
                and quality in every piece.
              </p>
              <p>
                From the bustling streets of Gangnam to the creative studios of 
                Seongsu-dong, we source designs that represent the cutting edge of 
                Korean fashion.
              </p>
              <p>
                These partnerships allow us to offer exclusive pieces that you won't 
                find in typical European retailers, while maintaining fair pricing 
                and supporting Korean creativity.
              </p>
            </div>
          </div>
          <div className="aspect-[4/5] bg-neutral-100">
            <img
              src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb2F0JTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc4MDU5MTM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Designer fashion"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl mb-6">Experience keurope</h2>
        <p className="text-neutral-600 mb-8">
          Discover our curated collection of Korean fashion pieces, 
          each selected with care for the modern European woman.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 hover:bg-neutral-800 transition-colors"
        >
          Shop Collection
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
