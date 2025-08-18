'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { format } from 'date-fns';
import { LayoutGrid, List, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostForm, { type Post } from './PostForm';

interface Author {
  id: string;
  title: string;
}

interface Category {
  id: string;
  title: string;
}

const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      // Add cache-busting and fresh data fetch
      const response = await fetch(`/api/cms/blog/posts?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('BlogPosts: Fetched posts:', data.length, 'posts');
        setPosts(data);
      } else {
        setError('Failed to load posts from BaseHub');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error connecting to BaseHub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
};

const BlogPosts = () => {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const { posts, loading, error, refetch } = usePosts();
  const router = useRouter();

  const handleSave = async (post: Post) => {
    console.log('BlogPosts: Starting save operation for post:', post);
    
    try {
      const method = post.id && post.id !== '' ? 'PUT' : 'POST';
      const url = post.id && post.id !== ''
        ? `/api/cms/blog/posts/${post.id}`
        : '/api/cms/blog/posts';

      console.log('BlogPosts: Making API request:', { method, url, post });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      console.log('BlogPosts: API response:', { status: response.status, ok: response.ok });

      const result = await response.json();
      console.log('BlogPosts: API response result:', result);

      if (response.ok && result.success) {
        console.log('BlogPosts: Save successful, result:', result);
        
        // Give BaseHub a moment to process the new content
        setTimeout(async () => {
          await refetch();
          router.refresh();
          console.log('BlogPosts: Refreshed posts list after creation');
        }, 1000);
        
        alert('Post saved successfully!');
      } else {
        console.error('BlogPosts: Save failed:', result);
        const errorMessage = result.error || 'Unknown error occurred';
        alert('Failed to save post: ' + errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('BlogPosts: Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save post. Please try again.';
      alert(errorMessage);
      throw error; // Re-throw so PostForm can handle it
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/blog/posts/${id}`, { 
        method: 'DELETE' 
      });

      if (response.ok) {
        refetch();
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        alert('Failed to delete post: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading posts from BaseHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <h3 className="mb-2 font-semibold text-red-600">Unable to load posts</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button asChild>
          <a
            href="https://basehub.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open BaseHub Dashboard
          </a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Blog Posts</h2>
          <p className="text-gray-600">
            Manage blog posts. Changes are automatically committed to BaseHub.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            pressed={view === 'table'}
            onPressedChange={() => setView('table')}
            aria-label="Table view"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={view === 'grid'}
            onPressedChange={() => setView('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Post</DialogTitle>
              </DialogHeader>
              <PostForm 
                post={{ 
                  id: '', 
                  title: '', 
                  description: '', 
                  body: '', 
                  date: new Date().toISOString().split('T')[0] 
                }} 
                onSave={handleSave} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'table' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post, index) => (
              <TableRow key={post.id || `post-${index}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-gray-500">
                      {post.description?.substring(0, 100)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">Content available</span>
                </TableCell>
                <TableCell>
                  {post.date ? format(new Date(post.date), 'MMM dd, yyyy') : 'No date'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`/blog/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Post</DialogTitle>
                        </DialogHeader>
                        <PostForm post={post} onSave={handleSave} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card key={post.id || `post-card-${index}`} className="p-4">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="mb-2 font-semibold">{post.title}</h3>
              <p className="mb-4 text-sm text-gray-600">
                {post.description?.substring(0, 150)}...
              </p>
              <div className="mb-4 text-xs text-gray-500">
                <div>Date: {post.date ? format(new Date(post.date), 'MMM dd, yyyy') : 'No date'}</div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <a
                    href={`/blog/${post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Post</DialogTitle>
                    </DialogHeader>
                    <PostForm post={post} onSave={handleSave} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="mb-2 font-semibold">No posts found</h3>
          <p className="text-gray-600 mb-4">
            Create your first blog post to get started.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <PostForm 
                post={{ 
                  id: '', 
                  title: '', 
                  description: '', 
                  body: '', 
                  date: new Date().toISOString().split('T')[0] 
                }} 
                onSave={handleSave} 
              />
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </div>
  );
};

export default BlogPosts;