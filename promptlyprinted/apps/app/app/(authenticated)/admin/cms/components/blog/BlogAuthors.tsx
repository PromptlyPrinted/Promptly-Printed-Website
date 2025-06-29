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
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AuthorForm from './AuthorForm';
import AuthorRow from './AuthorRow';

// --------------------------------------------------
// Author interface
// --------------------------------------------------
export interface Author {
  id: string; // Must be unique in your DB
  title: string;
  avatar: string;
  xUrl: string;
}

// --------------------------------------------------
// Hook to fetch authors
// --------------------------------------------------
function useAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.log('Authors data:', data);
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format for authors');
      }
      setAuthors(data);
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAuthors([]); // Reset authors on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  return { data: authors, loading, error, mutate: fetchAuthors };
}

// --------------------------------------------------
// Main BlogAuthors component
// --------------------------------------------------
export default function BlogAuthors() {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const router = useRouter();
  const { data: authors, loading, error, mutate } = useAuthors();

  // Loading
  if (loading) {
    return <div>Loading authors...</div>;
  }
  // Error
  if (error) {
    return <div className="text-red-500">Error loading authors: {error}</div>;
  }
  // No authors
  if (!authors) {
    return <div>No authors found.</div>;
  }

  // --------------------------------------------------
  // CRUD Handlers
  // --------------------------------------------------
  const handleSave = async (author: Author) => {
    try {
      const method = author.id ? 'PUT' : 'POST';
      const url = author.id
        ? `/api/cms/blog/authors/${author.id}`
        : '/api/cms/blog/authors';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(author),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${author.id ? 'update' : 'create'} author`
        );
      }

      // Refresh data
      mutate();
      router.refresh(); // For SSR/ISR revalidation if needed
    } catch (err) {
      console.error('Error saving author:', err);
      // Optional: show toast / user feedback
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/blog/authors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete author');
      }

      // Refresh data
      mutate();
      router.refresh();
    } catch (err) {
      console.error('Error deleting author:', err);
      // Optional: show toast / user feedback
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header section with toggles and "New Author" button */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Blog Authors</h2>
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

          {/* "New Author" Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>New Author</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Author</DialogTitle>
              </DialogHeader>
              <AuthorForm
                author={{
                  id: '',
                  title: '',
                  avatar: '',
                  xUrl: '',
                }}
                onSave={handleSave}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Toggle between table view and gallery view */}
      {view === 'table' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>X Profile</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <AuthorRow
                key={author.id}
                author={author}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      ) : (
        // Gallery (cards) view
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {authors.map((author) => (
            <Card key={author.id} className="p-4">
              {author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.title}
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                />
              )}
              <h3 className="mb-2 text-center font-semibold">{author.title}</h3>
              {author.xUrl ? (
                <a
                  href={author.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 block text-center text-blue-500 text-sm hover:underline"
                >
                  {author.xUrl}
                </a>
              ) : (
                <p className="text-center text-sm">No X profile</p>
              )}
              <div className="flex justify-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Author</DialogTitle>
                    </DialogHeader>
                    <AuthorForm author={author} onSave={handleSave} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(author.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
