'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import type React from 'react';
import { useState } from 'react';

export interface Post {
  id: string;
  title: string;
  description: string;
  body: string;
  date: string;
  slug?: string;
  image?: string;
}

interface PostFormProps {
  post: Post;
  onSave: (post: Post) => void;
}

export default function PostForm({ post, onSave }: PostFormProps) {
  const [formData, setFormData] = useState<Post>({
    id: post.id,
    title: post.title || '',
    description: post.description || '',
    body: post.body || '',
    date: post.date || new Date().toISOString().split('T')[0],
    slug: post.slug || '',
    image: post.image || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    console.log('PostForm: Submitting form with data:', formData);
    
    try {
      await onSave(formData);
      console.log('PostForm: Save completed successfully');
    } catch (error) {
      console.error('PostForm: Error saving post:', error);
      setError(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {/* Title */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="auto-generated-from-title"
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

      {/* Body */}
      <div>
        <Label htmlFor="body">Content</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={10}
          placeholder="Write your blog post content here..."
        />
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      {/* Image URL */}
      <div>
        <Label htmlFor="image">Image URL (optional)</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Save button */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Post'}
      </Button>
    </form>
  );
}