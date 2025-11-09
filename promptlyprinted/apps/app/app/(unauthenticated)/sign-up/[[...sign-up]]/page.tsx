import { AuthPage } from '@/components/auth-page';
import { SIGN_UP_COPY } from '../../../../lib/auth-copy';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const SignUp = dynamic(() =>
  import('@repo/auth/components/sign-up').then((mod) => mod.SignUp)
);

export const metadata: Metadata = createMetadata(SIGN_UP_COPY);

const SignUpPage = () => (
  <AuthPage title={SIGN_UP_COPY.title} description={SIGN_UP_COPY.description}>
    <SignUp />
  </AuthPage>
);

export default SignUpPage;
