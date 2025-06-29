import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { redirect } from 'next/navigation';
import BlogAuthors from './components/blog/BlogAuthors';
import BlogCategories from './components/blog/categories';
import BlogPosts from './components/blog/posts';
import LegalPages from './components/legal/pages';

export default async function CMSPage() {
  const session = await auth();
  if (!session?.userId) redirect('/sign-in');

  // Verify admin status
  const user = await database.user.findUnique({
    where: { clerkId: session.userId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">CMS Dashboard</h1>
      </div>

      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="legal">Legal Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-4">
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
