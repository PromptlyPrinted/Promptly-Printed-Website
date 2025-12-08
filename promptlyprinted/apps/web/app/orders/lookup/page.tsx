'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { AlertCircle, Package, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface OrderData {
  id: number;
  createdAt: string;
  totalPrice: number;
  status: string;
  prodigiOrderId: string | null;
  prodigiStage: string | null;
  shippingMethod: string | null;
  recipient: {
    name: string;
    email: string;
    city: string;
    state: string | null;
    postalCode: string;
    countryCode: string;
  } | null;
  shipments: Array<{
    id: number;
    carrier: string;
    service: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
  }>;
  orderItems: Array<{
    id: number;
    copies: number;
    price: number;
    attributes: Record<string, unknown>;
  }>;
}

function OrderLookupContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState(tokenFromUrl || '');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  // Auto-lookup if token is in URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleTokenLookup();
    }
  }, [tokenFromUrl]);

  const handleTokenLookup = async () => {
    if (!token.trim()) {
      setError('Please enter your order token');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/lookup?token=${encodeURIComponent(token.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to find order');
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError('Failed to look up order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLookup = async () => {
    if (!email.trim() || !orderId.trim()) {
      setError('Please enter both email and order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/lookup?email=${encodeURIComponent(email.trim())}&orderId=${encodeURIComponent(orderId.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to find order');
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError('Failed to look up order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" onClick={() => setOrder(null)}>
            Look Up Another Order
          </Button>
        </div>

        {/* Status Card */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Order Status</h2>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                order.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'CANCELED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.status}
            </span>
            {order.prodigiStage && (
              <span className="text-muted-foreground text-sm">
                Production: {order.prodigiStage}
              </span>
            )}
          </div>
        </Card>

        {/* Tracking Card */}
        {order.shipments && order.shipments.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-xl">Tracking Information</h2>
            <div className="space-y-4">
              {order.shipments.map((shipment) => (
                <div key={shipment.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">
                        {shipment.carrier} - {shipment.service}
                      </p>
                      {shipment.trackingNumber && (
                        <p className="font-mono text-muted-foreground text-sm">
                          {shipment.trackingNumber}
                        </p>
                      )}
                    </div>
                    {shipment.trackingUrl && (
                      <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Track Package
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Order Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-xl">Order Summary</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items</dt>
                <dd>{order.orderItems.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{order.shippingMethod || 'Standard'}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>£{order.totalPrice.toFixed(2)}</dd>
              </div>
            </dl>
          </Card>

          {order.recipient && (
            <Card className="p-6">
              <h2 className="mb-4 font-semibold text-xl">Shipping To</h2>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{order.recipient.name}</p>
                <p>
                  {order.recipient.city}
                  {order.recipient.state && `, ${order.recipient.state}`}{' '}
                  {order.recipient.postalCode}
                </p>
                <p>{order.recipient.countryCode}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Items */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => {
              const attrs = item.attributes as Record<string, unknown>;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {(attrs?.productName as string) || 'Product'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Qty: {item.copies}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    £{(item.price * item.copies).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="text-center text-muted-foreground text-sm">
          Need help? Contact us at{' '}
          <a
            href="mailto:support@promptlyprinted.com"
            className="text-blue-600 hover:underline"
          >
            support@promptlyprinted.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="text-center">
        <h1 className="font-bold text-3xl">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Look up your order using the token from your confirmation email, or
          your email address and order number.
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue={tokenFromUrl ? 'token' : 'email'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="token">Order Token</TabsTrigger>
            <TabsTrigger value="email">Email & Order #</TabsTrigger>
          </TabsList>

          <TabsContent value="token" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Order Token</Label>
              <Input
                id="token"
                placeholder="Paste your order token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Find this in your order confirmation email
              </p>
            </div>
            <Button
              onClick={handleTokenLookup}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                'Looking up...'
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Order
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Order Number</Label>
              <Input
                id="orderId"
                placeholder="12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <Button
              onClick={handleEmailLookup}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                'Looking up...'
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Order
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Have an account?{' '}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </Link>{' '}
          to view all your orders.
        </p>
      </div>
    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="text-center">
          <h1 className="font-bold text-3xl">Track Your Order</h1>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OrderLookupContent />
    </Suspense>
  );
}
