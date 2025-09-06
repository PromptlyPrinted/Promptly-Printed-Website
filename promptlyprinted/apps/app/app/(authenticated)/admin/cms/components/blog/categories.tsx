'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
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
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { LayoutGrid, List, Plus, Edit, Trash2 } from 'lucide-react';
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

  const createCategory = async (title: string) => {
    try {
      const response = await fetch('/api/cms/blog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (response.ok) {
        await fetchCategories(); // Refresh the list
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const updateCategory = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/cms/blog/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (response.ok) {
        await fetchCategories(); // Refresh the list
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/blog/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchCategories(); // Refresh the list
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refetch: fetchCategories, createCategory, updateCategory, deleteCategory };
};

const BlogCategories = () => {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryTitle, setEditCategoryTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryTitle.trim()) return;

    setIsCreating(true);
    const result = await createCategory(newCategoryTitle.trim());
    setIsCreating(false);

    if (result.success) {
      setNewCategoryTitle('');
      setIsCreateDialogOpen(false);
    } else {
      alert(`Failed to create category: ${result.error}`);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryTitle(category.title);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryTitle.trim()) return;

    setIsEditing(true);
    const result = await updateCategory(editingCategory.id, editCategoryTitle.trim());
    setIsEditing(false);

    if (result.success) {
      setEditingCategory(null);
      setEditCategoryTitle('');
      setIsEditDialogOpen(false);
    } else {
      alert(`Failed to update category: ${result.error}`);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    setIsDeleting(category.id);
    const result = await deleteCategory(category.id);
    setIsDeleting(null);

    if (!result.success) {
      alert(`Failed to delete category: ${result.error}`);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Categories</h2>
          <p className="text-gray-600">
            Create and manage blog post categories. Categories help organize your content.
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add a Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for organizing your blog posts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="categoryTitle">Category Title</Label>
                  <Input
                    id="categoryTitle"
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    placeholder="Enter category title"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewCategoryTitle('');
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || !newCategoryTitle.trim()}>
                    {isCreating ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'table' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category: Category, index: number) => (
              <TableRow key={category.id || `category-${index}`}>
                <TableCell>{category.title}</TableCell>
                <TableCell className="text-gray-500 font-mono text-sm">{category.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCategory(category)}
                      disabled={isEditing || isDeleting === category.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isEditing || isDeleting === category.id}
                        >
                          {isDeleting === category.id ? (
                            <span className="h-4 w-4 animate-spin">⟳</span>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category: Category, index: number) => (
            <Card key={category.id || `category-card-${index}`} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold flex-1">
                  {category.title}
                </h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                    disabled={isEditing || isDeleting === category.id}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isEditing || isDeleting === category.id}
                      >
                        {isDeleting === category.id ? (
                          <span className="h-3 w-3 animate-spin">⟳</span>
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
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
            Create your first category to start organizing your blog posts.
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for organizing your blog posts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="categoryTitle">Category Title</Label>
                  <Input
                    id="categoryTitle"
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    placeholder="Enter category title"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewCategoryTitle('');
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || !newCategoryTitle.trim()}>
                    {isCreating ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category title.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <Label htmlFor="editCategoryTitle">Category Title</Label>
              <Input
                id="editCategoryTitle"
                value={editCategoryTitle}
                onChange={(e) => setEditCategoryTitle(e.target.value)}
                placeholder="Enter category title"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCategory(null);
                  setEditCategoryTitle('');
                }}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing || !editCategoryTitle.trim()}>
                {isEditing ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogCategories;