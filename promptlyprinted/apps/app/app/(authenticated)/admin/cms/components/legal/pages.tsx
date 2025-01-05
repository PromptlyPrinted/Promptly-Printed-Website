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
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Label } from "@repo/design-system/components/ui/label";
import { Toggle } from "@repo/design-system/components/ui/toggle";
import { LayoutGrid, List } from "lucide-react";

interface LegalPage {
  id: string;
  title: string;
  description: string;
  body: string;
}

const useLegalPages = () => {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/cms/legal/pages");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching legal pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return { data: pages, loading, mutate: fetchPages };
};

export default function LegalPages() {
  const [view, setView] = useState<"table" | "gallery">("table");
  const router = useRouter();

  const { data: pages, mutate } = useLegalPages();

  const handleSave = async (page: LegalPage) => {
    const method = page.id ? "PUT" : "POST";
    const url = page.id
      ? `/api/cms/legal/pages/${page.id}`
      : "/api/cms/legal/pages";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page),
    });

    mutate();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms/legal/pages/${id}`, { method: "DELETE" });
    mutate();
    router.refresh();
  };

  if (!pages) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Legal Pages</h2>
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
              <Button>New Page</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Legal Page</DialogTitle>
              </DialogHeader>
              <LegalPageForm
                page={{
                  id: "",
                  title: "",
                  description: "",
                  body: "",
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
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page: LegalPage) => (
              <TableRow key={page.id}>
                <TableCell>{page.title}</TableCell>
                <TableCell>{page.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Legal Page</DialogTitle>
                        </DialogHeader>
                        <LegalPageForm
                          page={page}
                          onSave={handleSave}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page: LegalPage) => (
            <Card key={page.id} className="p-4">
              <h3 className="font-semibold mb-2">{page.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {page.description}
              </p>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Legal Page</DialogTitle>
                    </DialogHeader>
                    <LegalPageForm
                      page={page}
                      onSave={handleSave}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(page.id)}
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

interface LegalPageFormProps {
  page: LegalPage;
  onSave: (page: LegalPage) => void;
}

function LegalPageForm({ page, onSave }: LegalPageFormProps) {
  const [formData, setFormData] = useState<LegalPage>(page);

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
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) =>
            setFormData({ ...formData, body: e.target.value })
          }
          className="min-h-[200px]"
        />
      </div>

      <Button type="submit">Save</Button>
    </form>
  );
} 