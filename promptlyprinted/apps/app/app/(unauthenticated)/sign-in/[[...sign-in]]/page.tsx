import { AuthPage } from '@/components/auth-page';
import { SIGN_IN_COPY } from '../../../../lib/auth-copy';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const SignIn = dynamic(() =>
  import('@repo/auth/components/sign-in').then((mod) => mod.SignIn)
);

export const metadata: Metadata = createMetadata(SIGN_IN_COPY);

const SignInPage = () => (
  <AuthPage title={SIGN_IN_COPY.title} description={SIGN_IN_COPY.description}>
    <SignIn />
  </AuthPage>
);

export default SignInPage;
