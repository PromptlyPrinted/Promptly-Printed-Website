"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { Card } from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Toggle } from "@repo/design-system/components/ui/toggle";
import { LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { CategoryForm } from "./category-form";

interface Category {
  id: number;
  name: string;
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
  const [view, setView] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (category: Partial<Category>) => {
    try {
      const method = category.id ? "PUT" : "POST";
      const url = category.id
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      const updatedCategory = await response.json();
      
      if (category.id) {
        setCategories(categories.map((c) => 
          c.id === category.id ? updatedCategory : c
        ));
        toast.success("Category updated successfully");
      } else {
        setCategories([...categories, updatedCategory]);
        toast.success("Category created successfully");
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Toggle
              pressed={view === "table"}
              onPressedChange={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={view === "grid"}
              onPressedChange={() => setView("grid")}
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

      {view === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
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
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category._count.products} products
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
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Created: {new Date(category.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(category.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 