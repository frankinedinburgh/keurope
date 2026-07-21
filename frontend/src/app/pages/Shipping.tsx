export function Shipping() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl mb-8">Shipping Information</h1>

        <div className="space-y-8 text-neutral-600">
          <div>
            <h2 className="text-2xl font-medium text-black mb-4">Delivery Times</h2>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Ireland:</strong> 3-5 business days</li>
              <li>• <strong>EU:</strong> 7-10 business days</li>
              <li>• <strong>UK:</strong> 7-10 business days</li>
              <li>• <strong>Europe (other):</strong> 10-15 business days</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-medium text-black mb-4">Shipping Costs</h2>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Ireland:</strong> €5.00</li>
              <li>• <strong>EU:</strong> €9.00</li>
              <li>• <strong>International:</strong> €15.00</li>
              <li>• <strong>Free shipping:</strong> Orders over €150</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-medium text-black mb-4">How It Works</h2>
            <p className="mb-4">
              All orders are carefully packaged and shipped within 2 business days of purchase.
              You'll receive a tracking number via email so you can monitor your delivery.
            </p>
            <p>
              Each K-Europe piece is wrapped with care to ensure it arrives in perfect condition.
              We work with trusted courier services to guarantee timely, secure delivery across Europe.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-medium text-black mb-4">Questions?</h2>
            <p>
              For specific shipping inquiries or to track your order, please contact us at
              <strong> hello@k-europe.com</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
