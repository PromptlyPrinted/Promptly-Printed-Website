'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  ExternalLink,
  FileText,
  Users,
  Tags,
  GitBranch,
  Settings,
  BookOpen,
  Zap,
} from 'lucide-react';

const BaseHubIntegration = () => {
  const quickActions = [
    {
      title: 'Create New Blog Post',
      description: 'Write and publish a new blog post',
      icon: FileText,
      href: 'https://basehub.com',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Authors',
      description: 'Add or edit author profiles',
      icon: Users,
      href: 'https://basehub.com',
      color: 'bg-green-500',
    },
    {
      title: 'Organize Categories',
      description: 'Create and manage content categories',
      icon: Tags,
      href: 'https://basehub.com',
      color: 'bg-purple-500',
    },
    {
      title: 'Branch Management',
      description: 'Create branches for draft content',
      icon: GitBranch,
      href: 'https://basehub.com',
      color: 'bg-orange-500',
    },
  ];

  const features = [
    {
      title: 'Git-Based Workflow',
      description: 'All content changes are version controlled through Git',
      benefits: ['Full revision history', 'Branching for drafts', 'Collaborative editing'],
    },
    {
      title: 'Type-Safe Content',
      description: 'BaseHub generates TypeScript types for your content',
      benefits: ['Auto-completion in IDE', 'Compile-time validation', 'Better developer experience'],
    },
    {
      title: 'Real-time Updates',
      description: 'Content updates are reflected immediately on your site',
      benefits: ['Instant publishing', 'Preview modes', 'Live collaboration'],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-bold text-3xl mb-4">BaseHub Content Management</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your content is managed through BaseHub's Git-based CMS. Use the tools below to create, 
          edit, and publish content with full version control and type safety.
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-orange-500" />
          <h2 className="font-semibold text-xl">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`${action.color} p-3 rounded-full`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
                <Button asChild size="sm" className="w-full">
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center"
                  >
                    Open in BaseHub
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Repository Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Branch</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">main</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Sync</span>
              <span className="text-sm text-gray-500">Auto-synced</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Content Status</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Published</span>
            </div>
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <a
              href="https://basehub.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              View in BaseHub Dashboard
            </a>
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Content Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Blog Posts</span>
              <span className="font-semibold">Loading...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Authors</span>
              <span className="font-semibold">Loading...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Categories</span>
              <span className="font-semibold">Loading...</span>
            </div>
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <a href="/blog" target="_blank" rel="noopener noreferrer">
              Preview Published Content
            </a>
          </Button>
        </Card>
      </div>

      {/* Features */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold text-xl">BaseHub Features</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-3">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
              <ul className="space-y-1">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="text-xs text-gray-500 flex items-center">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Help & Documentation */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-lg">Need Help?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Documentation</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <a
                  href="https://docs.basehub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 inline-flex items-center"
                >
                  BaseHub Documentation
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.basehub.com/api-reference"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 inline-flex items-center"
                >
                  API Reference
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Quick Tips</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Use branches for draft content</li>
              <li>• Content updates are deployed automatically</li>
              <li>• All changes are version controlled</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BaseHubIntegration;