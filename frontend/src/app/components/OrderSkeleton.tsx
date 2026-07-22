import { Skeleton } from './Skeleton';

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div>
          <Skeleton className="h-4 w-10 mb-2" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div>
          <Skeleton className="h-4 w-10 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div>
          <Skeleton className="h-4 w-12 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mt-6 mb-6">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <OrderSkeleton key={i} />
      ))}
    </div>
  );
}
