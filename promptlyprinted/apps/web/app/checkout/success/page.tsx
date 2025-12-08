import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/get-image-url';
import { prisma } from '@repo/database';
import { env } from '@repo/env';
import { square } from '@repo/payments';
import { CheckCircle, Trophy, Sparkles, ArrowRight, Gift } from 'lucide-react';
import { ClearCart } from './ClearCart';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { tshirtDetails } from '@/data/products';

interface OrderItem {
  id: number;
  assets: Array<{
    url: string;
    printArea?: string;
  }> | null;
  attributes?: {
    sku?: string;
    size?: string;
    color?: string;
    sizing?: 'fillPrintArea' | 'fitPrintArea';
    printArea?: string;
  };
  copies: number;
  price: number;
}

// Get featured products for upsell (different categories)
function getUpsellProducts(purchasedSku?: string) {
  const products = Object.values(tshirtDetails).slice(0, 8); // Get first 8 products
  
  // Filter out the purchased product and get variety
  return products
    .filter((p) => p.sku !== purchasedSku)
    .slice(0, 4) // Show 4 upsell products
    .map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category,
      coverImage: p.imageUrls?.cover || '/placeholder.png',
      productType: p.productType,
    }));
}

// Create slug from product name
const createSlug = (str: string) =>
  str.toLowerCase().replace(/[''\"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');


export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string; order_id?: string; orderId?: string }>;
}) {
  const params = await searchParams;
  const checkoutId = params.checkout_id;

  // orderId = our database order ID (number)
  // order_id = Square order ID (string starting with letters)
  const dbOrderIdParam = params.orderId;
  const squareOrderId = params.order_id;

  if (!checkoutId && !squareOrderId && !dbOrderIdParam) {
    redirect('/');
  }

  let squareOrder: any = null;
  let paymentStatus = 'unknown';
  let dbOrder: any = null;

  // If we have a database order ID from the redirect URL, fetch the order
  if (dbOrderIdParam) {
    try {
      const orderIdNum = Number.parseInt(dbOrderIdParam);
      if (!isNaN(orderIdNum)) {
        dbOrder = await prisma.order.findUnique({
          where: { id: orderIdNum },
          include: {
            recipient: true,
            orderItems: true,
          },
        });

        if (dbOrder) {
          console.log('[Success Page] Order found:', {
            orderId: dbOrder.id,
            status: dbOrder.status,
            hasSquareOrderId: !!dbOrder.metadata?.squareOrderId,
          });

          // Try to get Square order ID from metadata
          const metadata = dbOrder.metadata as any;
          if (metadata?.squareOrderId && !squareOrderId) {
            // Use the Square order ID from metadata if not provided in URL
            const squareOrderIdFromMetadata = metadata.squareOrderId;
            try {
              const orderResponse = await square.orders.get({ orderId: squareOrderIdFromMetadata });
              squareOrder = orderResponse.order;
              if (squareOrder?.tenders && squareOrder.tenders.length > 0) {
                paymentStatus = squareOrder.tenders[0].cardDetails ? 'paid' : 'pending';
              }
            } catch (error) {
              console.error('Error retrieving Square order from metadata:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching database order:', error);
    }
  }

  // Get Square order details using Square order ID if provided in URL
  if (squareOrderId && !squareOrder) {
    try {
      const orderResponse = await square.orders.get({ orderId: squareOrderId });
      squareOrder = orderResponse.order;
      // Check if order has payment
      if (squareOrder?.tenders && squareOrder.tenders.length > 0) {
        paymentStatus = squareOrder.tenders[0].cardDetails ? 'paid' : 'pending';
      }
    } catch (error) {
      console.error('Error retrieving Square order:', error);
      // Don't redirect here, we might have the database order
    }
  }

  // Update order recipient with shipping address if payment was successful
  // Use dbOrder if we have it, otherwise get from Square metadata
  const orderToUpdate = dbOrder || (squareOrder?.metadata?.orderId ? Number.parseInt(squareOrder.metadata.orderId) : null);

  if (paymentStatus === 'paid' && orderToUpdate) {
    try {
      const dbOrderId = typeof orderToUpdate === 'number' ? orderToUpdate : orderToUpdate.id;

      // First, check if a payment with this Square order ID already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeId: squareOrderId },
      });

      // Get fulfillment info from Square order (shipping address)
      const fulfillment = squareOrder.fulfillments?.[0];
      const shipmentDetails = fulfillment?.shipmentDetails;
      const recipient = shipmentDetails?.recipient;

      if (existingPayment) {

        // Update the order recipient details only
        // We do NOT update status or create payment here to avoid race conditions with the webhook
        await prisma.order.update({
          where: {
            id: dbOrderId,
          },
          data: {
            recipient: {
              update: {
                name: recipient?.displayName || 'Pending',
                email: recipient?.emailAddress || 'pending@example.com',
                phoneNumber: recipient?.phoneNumber || undefined,
                addressLine1: recipient?.address?.addressLine1 || 'Pending',
                addressLine2: recipient?.address?.addressLine2 || undefined,
                postalCode: recipient?.address?.postalCode || '00000',
                countryCode: recipient?.address?.country || 'US',
                city: recipient?.address?.locality || 'Pending',
                state: recipient?.address?.administrativeDistrictLevel1 || undefined,
              },
            },
          },
        });
      } else {
        // Update the order recipient details only
        // We do NOT update status or create payment here to avoid race conditions with the webhook
        await prisma.order.update({
          where: {
            id: dbOrderId,
          },
          data: {
            recipient: {
              update: {
                name: recipient?.displayName || 'Pending',
                email: recipient?.emailAddress || 'pending@example.com',
                phoneNumber: recipient?.phoneNumber || undefined,
                addressLine1: recipient?.address?.addressLine1 || 'Pending',
                addressLine2: recipient?.address?.addressLine2 || undefined,
                postalCode: recipient?.address?.postalCode || '00000',
                countryCode: recipient?.address?.country || 'US',
                city: recipient?.address?.locality || 'Pending',
                state: recipient?.address?.administrativeDistrictLevel1 || undefined,
              },
            },
          },
        });
      }

      // Add to Resend Audience (Marketing)
      if (env.RESEND_AUDIENCE_ID && recipient?.emailAddress) {
        try {
          if (env.RESEND_API_KEY) {
             await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: recipient.emailAddress,
                first_name: recipient.displayName?.split(' ')[0],
                last_name: recipient.displayName?.split(' ').slice(1).join(' '),
                unsubscribed: false,
              }),
            });
          }
        } catch (err) {
          console.error('Failed to add customer to Resend Audience:', err);
        }
      }

    } catch (error) {
      console.error('Error updating order:', error);
      // Log the error for monitoring
      await prisma.log.create({
        data: {
          level: 'ERROR',
          message: 'Failed to update order after payment',
          metadata: {
            squareOrderId: squareOrderId,
            dbOrderId: squareOrder?.metadata?.orderId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
        },
      });
    }
  }

  // Get active competition for the competition entry section
  const activeCompetition = await prisma.competition.findFirst({
    where: {
      isActive: true,
      endDate: { gte: new Date() },
    },
    orderBy: { endDate: 'asc' },
  });

  // Get first order item's SKU for upsell filtering
  const purchasedSku = dbOrder?.orderItems?.[0]?.attributes?.sku;
  const upsellProducts = getUpsellProducts(purchasedSku);

  // Get the design image from the order for competition entry
  const orderDesignUrl = dbOrder?.orderItems?.[0]?.assets?.[0]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <ClearCart />
      
      {/* Success Header */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-4 font-bold text-4xl text-gray-900">Thank You! 🎉</h1>
            <p className="text-lg text-gray-600">
              Your order has been successfully placed. We'll send you an email
              with your order details and tracking information soon.
            </p>
            {dbOrder && (
              <div className="mt-6 inline-block rounded-xl bg-white px-6 py-4 shadow-sm border">
                <p className="font-medium text-gray-900">Order #{dbOrder.id}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Status: {dbOrder.status === 'COMPLETED' ? 'Processing' : 'Pending'}
                </p>
                {dbOrder.recipient?.email && dbOrder.recipient.email !== 'pending@checkout.com' && (
                  <p className="mt-1 text-sm text-gray-500">
                    Confirmation sent to: {dbOrder.recipient.email}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button variant="outline" className="w-full sm:w-auto">
                View Order Status
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-[#16C1A8] hover:bg-[#16C1A8]/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Competition Entry Section */}
      {activeCompetition && (
        <div className="bg-gradient-to-r from-[#0D2C45] to-[#16C1A8]/20 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  Enter the {activeCompetition.theme}!
                </h2>
              </div>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Submit your design to our {activeCompetition.theme} competition and win <span className="font-bold text-yellow-400">{activeCompetition.prize}</span>! 
                Share your creation with our community and get votes to climb the leaderboard.
              </p>
              
              {orderDesignUrl && (
                <div className="mb-6">
                  <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden border-2 border-white/30">
                    <Image
                      src={orderDesignUrl}
                      alt="Your design"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-white/60 mt-2">Your purchased design</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/my-images`}>
                  <Button className="gap-2 bg-[#FF8A26] hover:bg-[#FF8A26]/90 text-white px-8">
                    <Sparkles className="h-4 w-4" />
                    Submit to Competition
                  </Button>
                </Link>
                <Link href={`/showcase?competition=${activeCompetition.id}`}>
                  <Button variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 px-8">
                    View Entries
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-white/50 mt-4">
                Competition ends {new Date(activeCompetition.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Upsell Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="h-6 w-6 text-[#16C1A8]" />
              <h2 className="text-2xl font-bold text-gray-900">Create More Designs</h2>
            </div>
            <p className="text-gray-600 max-w-lg mx-auto">
              Love your custom design? Bring it to life on more products or explore new styles!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {upsellProducts.map((product) => (
              <Link
                key={product.sku}
                href={`/design/${createSlug(product.name)}`}
                className="group"
              >
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-[#16C1A8]">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" className="w-full bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white text-xs">
                        Design Now
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/products/all">
              <Button variant="outline" className="gap-2">
                Browse All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
