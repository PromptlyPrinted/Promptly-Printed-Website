import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import BaseHubIntegration from './basehub-integration';
import BlogAuthors from './components/blog/BlogAuthors';
import BlogCategories from './components/blog/categories';
import BlogPosts from './components/blog/posts';
import LegalPages from './components/legal/pages';

export default async function CMSPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/sign-in');

  // Verify admin status
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">BaseHub Dashboard</TabsTrigger>
          <TabsTrigger value="content">Content Overview</TabsTrigger>
          <TabsTrigger value="legal">Legal Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <BaseHubIntegration />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="authors">Authors</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <Card className="p-4">
                <BlogPosts />
              </Card>
            </TabsContent>

            <TabsContent value="authors">
              <Card className="p-4">
                <BlogAuthors />
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card className="p-4">
                <BlogCategories />
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="legal">
          <Card className="p-4">
            <LegalPages />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
