import { Toolbar } from '@repo/cms/components/toolbar';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toolbar />
    </>
  );
}
