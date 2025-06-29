'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import type React from 'react';
import { useState } from 'react';
import type { Author } from './BlogAuthors';

interface AuthorFormProps {
  author: Author;
  onSave: (author: Author) => void;
}

export default function AuthorForm({ author, onSave }: AuthorFormProps) {
  const [formData, setFormData] = useState<Author>({
    id: author.id,
    title: author.title || '',
    avatar: author.avatar || '',
    xUrl: author.xUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <Label htmlFor="title">Name</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Avatar URL */}
      <div>
        <Label htmlFor="avatar">Avatar URL</Label>
        <Input
          id="avatar"
          value={formData.avatar}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
        />
      </div>

      {/* X Profile URL */}
      <div>
        <Label htmlFor="xUrl">X Profile URL</Label>
        <Input
          id="xUrl"
          value={formData.xUrl}
          onChange={(e) => setFormData({ ...formData, xUrl: e.target.value })}
        />
      </div>

      {/* Save button */}
      <Button type="submit">Save</Button>
    </form>
  );
}
