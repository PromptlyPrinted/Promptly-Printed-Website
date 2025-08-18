'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { LayoutGrid, List, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  title: string;
}

const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/cms/blog/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refetch: fetchCategories };
};

const BlogCategories = () => {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const { categories, loading } = useCategories();

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Categories</h2>
          <p className="text-gray-600">
            Manage categories in BaseHub dashboard. Changes will appear here after publishing.
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
          <Button asChild>
            <a
              href="https://basehub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              Manage in BaseHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {view === 'table' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category: Category, index: number) => (
              <TableRow key={category.id || `category-${index}`}>
                <TableCell>{category.title}</TableCell>
                <TableCell className="text-gray-500 font-mono text-sm">{category.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category: Category, index: number) => (
            <Card key={category.id || `category-card-${index}`} className="p-4">
              <h3 className="mb-4 text-center font-semibold">
                {category.title}
              </h3>
              <div className="text-center text-sm text-gray-500 font-mono">
                {category.id}
              </div>
            </Card>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="mb-2 font-semibold">No categories found</h3>
          <p className="text-gray-600 mb-4">
            Create your first category in the BaseHub dashboard.
          </p>
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
      )}
    </div>
  );
};

export default BlogCategories;