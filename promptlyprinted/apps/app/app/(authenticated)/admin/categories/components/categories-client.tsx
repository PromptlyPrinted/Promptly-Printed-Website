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
import { Switch } from '@repo/design-system/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { LayoutGrid, List, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CategoryForm } from './category-form';

interface Category {
  id: number;
  name: string;
  isActive: boolean;
  _count: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredCategories = categories
    .filter((category) => {
      // Filter to show only Apparel (excluding Socks) for now
      const isApparel = category.name.toLowerCase().includes('apparel');
      const isSocks = category.name.toLowerCase().includes('socks');
      return isApparel && !isSocks;
    })
    .filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );

  const handleSave = async (category: Partial<Category>) => {
    try {
      const method = category.id ? 'PUT' : 'POST';
      const url = category.id
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error('Failed to save category');
      }

      const updatedCategory = await response.json();

      if (category.id) {
        setCategories(
          categories.map((c) => (c.id === category.id ? updatedCategory : c))
        );
        toast.success('Category updated successfully');
      } else {
        setCategories([...categories, updatedCategory]);
        toast.success('Category created successfully');
      }

      router.refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories(categories.filter((c) => c.id !== id));
      toast.success('Category deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (id: number, currentState: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle category status');
      }

      const updatedCategory = await response.json();
      setCategories(
        categories.map((c) => (c.id === id ? updatedCategory : c))
      );
      toast.success(`Category ${!currentState ? 'activated' : 'deactivated'}`);
      router.refresh();
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Failed to toggle category status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Toggle
              pressed={view === 'table'}
              onPressedChange={() => setView('table')}
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={view === 'grid'}
              onPressedChange={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSubmit={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      {view === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(category.id, category.isActive)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(category.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                          </DialogHeader>
                          <CategoryForm
                            category={category}
                            onSubmit={handleSave}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (category._count.products > 0) {
                            toast.error(
                              `Cannot delete category with ${category._count.products} products`
                            );
                            return;
                          }
                          handleDelete(category.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() =>
                        handleToggleActive(category.id, category.isActive)
                      }
                    />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {category._count.products} products • {category.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <CategoryForm category={category} onSubmit={handleSave} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (category._count.products > 0) {
                        toast.error(
                          `Cannot delete category with ${category._count.products} products`
                        );
                        return;
                      }
                      handleDelete(category.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-muted-foreground text-sm">
                <p>
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Updated: {new Date(category.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
