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

interface LegalPage {
  id: string;
  title: string;
  description: string;
  body: string;
}

const useLegalPages = () => {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/cms/legal/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      } else {
        setError('Failed to load legal pages from BaseHub');
      }
    } catch (error) {
      console.error('Error fetching legal pages:', error);
      setError('Error connecting to BaseHub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return { pages, loading, error, refetch: fetchPages };
};

const LegalPages = () => {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const { pages, loading, error } = useLegalPages();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading legal pages from BaseHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <h3 className="mb-2 font-semibold text-red-600">Unable to load legal pages</h3>
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
          <h2 className="font-semibold text-2xl">Legal Pages</h2>
          <p className="text-gray-600">
            Manage legal pages in BaseHub dashboard. Changes will appear here after publishing.
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
              <TableHead>Description</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page, index) => (
              <TableRow key={page.id || `page-${index}`}>
                <TableCell>
                  <div className="font-medium">{page.title}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {page.description?.substring(0, 100)}...
                  </div>
                </TableCell>
                <TableCell className="text-gray-500 font-mono text-sm">{page.id}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/legal/${page.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page, index) => (
            <Card key={page.id || `page-card-${index}`} className="p-4">
              <h3 className="mb-2 font-semibold">{page.title}</h3>
              <p className="mb-4 text-sm text-gray-600">
                {page.description?.substring(0, 150)}...
              </p>
              <div className="mb-4 text-xs text-gray-500 font-mono">
                ID: {page.id}
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a
                  href={`/legal/${page.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Page
                </a>
              </Button>
            </Card>
          ))}
        </div>
      )}

      {pages.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="mb-2 font-semibold">No legal pages found</h3>
          <p className="text-gray-600 mb-4">
            Create your first legal page in the BaseHub dashboard.
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

export default LegalPages;