import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const headers = await import('next/headers').then(h => h.headers());
  console.log('🍪 Server-side cookies:', headers.get('cookie'));

  // Extract Better Auth cookies specifically
  const cookies = headers.get('cookie') || '';
  const betterAuthToken = cookies.split(';').find(c => c.trim().startsWith('better-auth.session_token='));
  const promptlyAuthToken = cookies.split(';').find(c => c.trim().startsWith('promptly-auth.session_token='));
  console.log('🔑 better-auth.session_token:', betterAuthToken ? 'PRESENT' : 'MISSING');
  console.log('🔑 promptly-auth.session_token:', promptlyAuthToken ? 'PRESENT' : 'MISSING');

  // Enhanced debugging - show all cookies and headers
  console.log('📋 All cookies parsed:', cookies.split(';').map(c => c.trim()).filter(c => c.includes('auth')));
  console.log('🌐 Headers received:', Object.fromEntries(headers.entries()));
  console.log('🔗 Better Auth URL:', process.env.BETTER_AUTH_URL);
  console.log('🔗 Next Public Better Auth URL:', process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

  let session;
  try {
    console.log('🚀 Attempting session validation with Better Auth...');
    session = await auth.api.getSession({ headers });
    console.log('🔐 Server-side session result:', session ? 'FOUND' : 'NOT FOUND');
    if (session) {
      console.log('👤 User ID:', session.user?.id);
      console.log('👤 User email:', session.user?.email);
      console.log('📅 Session created:', session.session?.createdAt);
      console.log('📅 Session expires:', session.session?.expiresAt);
    } else {
      console.log('❌ Session is null - no valid session found');
    }
  } catch (error: any) {
    console.error('❌ Session validation error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    session = null;
  }

  if (!session?.user?.id) redirect('/sign-in');

  const dbUser = await database.user.findUnique({
    where: { id: session.user.id },
  });
  if (!dbUser)
    return <div className="container mx-auto p-4">User not found</div>;

  const orders = await database.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded border p-4">
              <p>
                <strong>Order #{order.id}</strong>
              </p>
              <p>Status: {order.status}</p>
              <p>Total: ${order.totalPrice.toFixed(2)}</p>
              <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
