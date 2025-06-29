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
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { format } from 'date-fns';
import { LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Author {
  id: string;
  title: string;
}

interface Category {
  id: string;
  title: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  authors: Author[];
  categories: Category[];
  body: string;
}

const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cms/blog/posts');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts');
      }
      const data = await response.json();
      console.log('Posts data:', data); // Debug log
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setPosts([]); // Reset posts on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { data: posts, loading, error, mutate: fetchPosts };
};

const useAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cms/blog/authors');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch authors');
      }
      const data = await response.json();
      console.log('Authors data:', data); // Debug log
      if (!Array.isArray(data)) {
        throw new Error('Invalid authors response format');
      }
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setAuthors([]); // Reset authors on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  return { data: authors, loading, error, mutate: fetchAuthors };
};

const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cms/blog/categories');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch categories');
      }
      const data = await response.json();
      console.log('Categories data:', data); // Debug log
      if (!Array.isArray(data)) {
        throw new Error('Invalid categories response format');
      }
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setCategories([]); // Reset categories on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { data: categories, loading, error, mutate: fetchCategories };
};

export default function BlogPosts() {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const router = useRouter();

  const { data: posts, loading, error: postsError, mutate } = usePosts();
  const { data: authors, error: authorsError } = useAuthors();
  const { data: categories, error: categoriesError } = useCategories();

  // Show loading state
  if (loading) {
    return <div>Loading posts...</div>;
  }

  // Show error states
  if (postsError) {
    return (
      <div className="text-red-500">Error loading posts: {postsError}</div>
    );
  }

  if (authorsError) {
    return (
      <div className="text-red-500">Error loading authors: {authorsError}</div>
    );
  }

  if (categoriesError) {
    return (
      <div className="text-red-500">
        Error loading categories: {categoriesError}
      </div>
    );
  }

  // Ensure we have the required data
  if (!posts || !authors || !categories) {
    return <div>Loading data...</div>;
  }

  const handleSave = async (post: Post) => {
    try {
      const method = post.id ? 'PUT' : 'POST';
      const url = post.id
        ? `/api/cms/blog/posts/${post.id}`
        : '/api/cms/blog/posts';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${post.id ? 'update' : 'create'} post`
        );
      }

      mutate();
      setEditingPost(null);
      router.refresh();
    } catch (error) {
      console.error('Error saving post:', error);
      // You might want to show an error toast or message here
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/blog/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }
      mutate();
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      // You might want to show an error toast or message here
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Blog Posts</h2>
        <div className="flex gap-2">
          <Toggle
            pressed={view === 'table'}
            onPressedChange={() => setView('table')}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={view === 'gallery'}
            onPressedChange={() => setView('gallery')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>New Post</Button>
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
                  date: new Date().toISOString(),
                  image: '',
                  authors: [],
                  categories: [],
                  body: '',
                }}
                authors={authors || []}
                categories={categories || []}
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
              <TableHead key="title">Title</TableHead>
              <TableHead key="date">Date</TableHead>
              <TableHead key="authors">Authors</TableHead>
              <TableHead key="categories">Categories</TableHead>
              <TableHead key="actions">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody key="posts-table-body">
            {posts.map((post: Post) => (
              <TableRow key={post.id}>
                <TableCell key={`${post.id}-title`}>{post.title}</TableCell>
                <TableCell key={`${post.id}-date`}>
                  {format(new Date(post.date), 'PP')}
                </TableCell>
                <TableCell key={`${post.id}-authors`}>
                  {post.authors.length > 0
                    ? post.authors.map((author: Author, index: number) => (
                        <span key={`${post.id}-author-${author.id}`}>
                          {author.title}
                          {index < post.authors.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    : '-'}
                </TableCell>
                <TableCell key={`${post.id}-categories`}>
                  {post.categories.length > 0
                    ? post.categories.map(
                        (category: Category, index: number) => (
                          <span key={`${post.id}-category-${category.id}`}>
                            {category.title}
                            {index < post.categories.length - 1 ? ', ' : ''}
                          </span>
                        )
                      )
                    : '-'}
                </TableCell>
                <TableCell key={`${post.id}-actions`}>
                  <div
                    key={`${post.id}-actions-container`}
                    className="flex gap-2"
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Post</DialogTitle>
                        </DialogHeader>
                        <PostForm
                          post={post}
                          authors={authors || []}
                          categories={categories || []}
                          onSave={handleSave}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <Card key={post.id} className="p-4">
              {post.image && (
                <img
                  key={`${post.id}-image`}
                  src={post.image}
                  alt={post.title}
                  className="mb-4 h-48 w-full rounded-md object-cover"
                />
              )}
              <h3 key={`${post.id}-title`} className="mb-2 font-semibold">
                {post.title}
              </h3>
              <p
                key={`${post.id}-description`}
                className="mb-4 text-muted-foreground text-sm"
              >
                {post.description}
              </p>
              <div
                key={`${post.id}-footer`}
                className="flex items-center justify-between"
              >
                <span key={`${post.id}-date`} className="text-sm">
                  {format(new Date(post.date), 'PP')}
                </span>
                <div key={`${post.id}-actions`} className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                      </DialogHeader>
                      <PostForm
                        post={post}
                        authors={authors || []}
                        categories={categories || []}
                        onSave={handleSave}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface PostFormProps {
  post: Post;
  authors: Author[];
  categories: Category[];
  onSave: (post: Post) => void;
}

function PostForm({ post, authors, categories, onSave }: PostFormProps) {
  const [formData, setFormData] = useState<Post>(post);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={format(new Date(formData.date), 'yyyy-MM-dd')}
          onChange={(e) =>
            setFormData({
              ...formData,
              date: new Date(e.target.value).toISOString(),
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          className="min-h-[200px]"
        />
      </div>

      <Button type="submit">Save</Button>
    </form>
  );
}
