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
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthorForm from './AuthorForm';
import AuthorRow from './AuthorRow';

export interface Author {
  id: string;
  title: string;
  avatar?: string;
  xUrl?: string;
}

const useAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/cms/blog/authors');
      if (response.ok) {
        const data = await response.json();
        setAuthors(data);
      } else {
        setError('Failed to load authors from BaseHub');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Error connecting to BaseHub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  return { authors, loading, error, refetch: fetchAuthors };
};

const BlogAuthors = () => {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const { authors, loading, error, refetch } = useAuthors();
  const router = useRouter();

  const handleSave = async (author: Author) => {
    try {
      const method = author.id && author.id !== '' ? 'PUT' : 'POST';
      const url = author.id && author.id !== ''
        ? `/api/cms/blog/authors/${author.id}`
        : '/api/cms/blog/authors';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(author),
      });

      if (response.ok) {
        refetch();
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        alert('Failed to save author: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save author. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this author?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/blog/authors/${id}`, { 
        method: 'DELETE' 
      });

      if (response.ok) {
        refetch();
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        alert('Failed to delete author: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete author. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading authors from BaseHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <h3 className="mb-2 font-semibold text-red-600">Unable to load authors</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Authors</h2>
          <p className="text-gray-600">
            Manage blog authors. Changes are automatically committed to BaseHub.
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
            pressed={view === 'gallery'}
            onPressedChange={() => setView('gallery')}
            aria-label="Gallery view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Author
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Author</DialogTitle>
              </DialogHeader>
              <AuthorForm 
                author={{ id: '', title: '', avatar: '', xUrl: '' }} 
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
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>X Profile</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author, index) => (
              <AuthorRow
                key={author.id || `author-${index}`}
                author={author}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {authors.map((author, index) => (
            <Card key={author.id || `author-card-${index}`} className="p-4">
              {author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.title}
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                />
              )}
              <h3 className="mb-2 text-center font-semibold">{author.title}</h3>
              {author.xUrl ? (
                <div className="text-center">
                  <a
                    href={author.xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View X Profile
                  </a>
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm">No X Profile</div>
              )}
              <div className="mt-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
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
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {authors.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="mb-2 font-semibold">No authors found</h3>
          <p className="text-gray-600 mb-4">
            Create your first author to get started.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Author
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Author</DialogTitle>
              </DialogHeader>
              <AuthorForm 
                author={{ id: '', title: '', avatar: '', xUrl: '' }} 
                onSave={handleSave} 
              />
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </div>
  );
};

export default BlogAuthors;