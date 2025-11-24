'use client';

import { CheckCircle, Circle, Package, Printer, Truck } from 'lucide-react';

interface OrderStatusTrackerProps {
  prodigiOrderId: string;
  status: string;
  prodigiStage?: string;
}

const STAGES = [
  { key: 'NotStarted', label: 'Order Received', icon: Circle },
  { key: 'Prep', label: 'Preparing', icon: Package },
  { key: 'InProduction', label: 'Printing', icon: Printer },
  { key: 'Shipping', label: 'Packaging', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
];

export function OrderStatusTracker({
  prodigiOrderId,
  status,
  prodigiStage,
}: OrderStatusTrackerProps) {
  // Determine current stage index
  const currentStageIndex = STAGES.findIndex(
    (stage) => stage.key === prodigiStage
  );

  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  if (status === 'CANCELED') {
    return (
      <div className="rounded-md bg-red-50 p-4 text-center">
        <p className="font-semibold text-red-900">Order Cancelled</p>
        <p className="mt-1 text-red-700 text-sm">
          This order has been cancelled and will not be shipped.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
          style={{
            width: `${(activeIndex / (STAGES.length - 1)) * 100}%`,
          }}
        />

        <div className="relative flex justify-between">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;

            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isActive
                        ? 'border-blue-600 bg-white text-blue-600'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <p
                  className={`mt-2 text-center text-xs font-medium ${
                    isActive || isCompleted
                      ? 'text-blue-900'
                      : 'text-gray-500'
                  }`}
                >
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="rounded-md bg-blue-50 p-4 text-center">
        <p className="font-semibold text-blue-900 text-sm">
          {activeIndex === 0 && 'We received your order!'}
          {activeIndex === 1 && 'Getting your design ready...'}
          {activeIndex === 2 && 'Your order is being printed!'}
          {activeIndex === 3 && 'Packing your order...'}
          {activeIndex === 4 && 'Your order is on its way!'}
        </p>
        <p className="mt-1 text-blue-700 text-xs">
          {activeIndex < 4
            ? "We'll notify you when it ships."
            : 'Check tracking information below.'}
        </p>
      </div>
    </div>
  );
}
