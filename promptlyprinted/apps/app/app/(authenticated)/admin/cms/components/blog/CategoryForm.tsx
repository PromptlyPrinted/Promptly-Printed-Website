'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import type React from 'react';
import { useState } from 'react';

export interface Category {
  id: string;
  title: string;
  description?: string;
}

interface CategoryFormProps {
  category: Category;
  onSave: (category: Category) => void;
}

export default function CategoryForm({ category, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    id: category.id,
    title: category.title || '',
    description: category.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="title">Category Name</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Save button */}
      <Button type="submit">Save</Button>
    </form>
  );
}