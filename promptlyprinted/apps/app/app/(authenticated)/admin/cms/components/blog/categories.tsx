'use client';

import { useState, useEffect } from "react";
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
import { LayoutGrid, List } from "lucide-react";

interface Category {
  id: string;
  title: string;
}

const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/cms/blog/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { data: categories, loading, mutate: fetchCategories };
};

export default function BlogCategories() {
  const [view, setView] = useState<"table" | "gallery">("table");
  const router = useRouter();

  const { data: categories, mutate } = useCategories();

  const handleSave = async (category: Category) => {
    const method = category.id ? "PUT" : "POST";
    const url = category.id
      ? `/api/cms/blog/categories/${category.id}`
      : "/api/cms/blog/categories";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });

    mutate();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms/blog/categories/${id}`, { method: "DELETE" });
    mutate();
    router.refresh();
  };

  if (!categories) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Categories</h2>
        <div className="flex gap-2">
          <Toggle
            pressed={view === "table"}
            onPressedChange={() => setView("table")}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={view === "gallery"}
            onPressedChange={() => setView("gallery")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>New Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={{
                  id: "",
                  title: "",
                }}
                onSave={handleSave}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category: Category) => (
              <TableRow key={category.id}>
                <TableCell>{category.title}</TableCell>
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
                          onSave={handleSave}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category: Category) => (
            <Card key={category.id} className="p-4">
              <h3 className="font-semibold text-center mb-4">
                {category.title}
              </h3>
              <div className="flex gap-2 justify-center">
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
                      onSave={handleSave}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
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

interface CategoryFormProps {
  category: Category;
  onSave: (category: Category) => void;
}

function CategoryForm({ category, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>(category);

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
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
      </div>

      <Button type="submit">Save</Button>
    </form>
  );
} 