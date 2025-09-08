'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Badge } from '@repo/design-system/components/ui/badge';
import { X } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';

export interface Post {
  id: string;
  title: string;
  description: string;
  body: string;
  date: string;
  slug?: string;
  image?: string;
  authors?: Array<{ id: string; title: string }>;
  categories?: Array<{ id: string; title: string }>;
}

interface Author {
  id: string;
  title: string;
}

interface Category {
  id: string;
  title: string;
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
    authors: post.authors || [],
    categories: post.categories || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available authors and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsRes, categoriesRes] = await Promise.all([
          fetch('/api/cms/blog/authors'),
          fetch('/api/cms/blog/categories')
        ]);
        
        if (authorsRes.ok) {
          const authors = await authorsRes.json();
          setAvailableAuthors(authors);
        }
        
        if (categoriesRes.ok) {
          const categories = await categoriesRes.json();
          setAvailableCategories(categories);
        }
      } catch (error) {
        console.error('Error fetching authors/categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update formData when post prop changes (for edit mode)
  useEffect(() => {
    setFormData({
      id: post.id,
      title: post.title || '',
      description: post.description || '',
      body: post.body || '',
      date: post.date || new Date().toISOString().split('T')[0],
      slug: post.slug || '',
      image: post.image || '',
      authors: post.authors || [],
      categories: post.categories || [],
    });
  }, [post]);

  // Helper functions for managing authors
  const addAuthor = (authorId: string) => {
    const author = availableAuthors.find(a => a.id === authorId);
    if (author && !formData.authors?.some(a => a.id === authorId)) {
      setFormData({
        ...formData,
        authors: [...(formData.authors || []), author]
      });
    }
  };

  const removeAuthor = (authorId: string) => {
    setFormData({
      ...formData,
      authors: formData.authors?.filter(a => a.id !== authorId) || []
    });
  };

  // Helper functions for managing categories
  const addCategory = (categoryId: string) => {
    const category = availableCategories.find(c => c.id === categoryId);
    if (category && !formData.categories?.some(c => c.id === categoryId)) {
      setFormData({
        ...formData,
        categories: [...(formData.categories || []), category]
      });
    }
  };

  const removeCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      categories: formData.categories?.filter(c => c.id !== categoryId) || []
    });
  };

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
    <div className="max-h-[60vh] overflow-y-auto pr-2">
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

      {/* Authors */}
      <div>
        <Label>Authors</Label>
        <div className="space-y-2">
          <Select onValueChange={addAuthor}>
            <SelectTrigger>
              <SelectValue placeholder="Select authors..." />
            </SelectTrigger>
            <SelectContent>
              {availableAuthors
                .filter(author => !formData.authors?.some(a => a.id === author.id))
                .map(author => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            {formData.authors?.map(author => (
              <Badge key={author.id} variant="secondary" className="flex items-center gap-1">
                {author.title}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeAuthor(author.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label>Categories</Label>
        <div className="space-y-2">
          <Select onValueChange={addCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select categories..." />
            </SelectTrigger>
            <SelectContent>
              {availableCategories
                .filter(category => !formData.categories?.some(c => c.id === category.id))
                .map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            {formData.categories?.map(category => (
              <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
                {category.title}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeCategory(category.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Post'}
      </Button>
    </form>
    </div>
  );
}