import { Suspense } from 'react';
import AnimatedBlogContent from './components/AnimatedBlogContent';

const mockPosts = [
  {
    _slug: 'ultimate-custom-tshirt-guide',
    _title: 'The Ultimate Guide to Custom T-Shirt Design in 2024',
    description: 'Discover the latest trends, AI-powered design tools, and expert tips for creating stunning custom apparel that stands out.',
    image: { url: '/blog/tshirt-guide.jpg', alt: 'Custom T-shirt design guide', width: 800, height: 400 },
    date: '2024-01-15',
    readTime: '8 min read',
    tags: ['Design', 'AI', 'Trends'],
    author: 'Sarah Johnson',
    featured: true
  },
  {
    _slug: 'ai-powered-printing',
    _title: 'How AI is Revolutionizing Print-on-Demand',
    description: 'Explore how artificial intelligence is transforming the way we create, customize, and print apparel.',
    image: { url: '/blog/ai-printing.jpg', alt: 'AI printing technology', width: 800, height: 400 },
    date: '2024-01-12',
    readTime: '6 min read',
    tags: ['AI', 'Technology', 'Innovation'],
    author: 'Mike Chen',
    featured: false
  }
];

const SimpleBlogIndex = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnimatedBlogContent posts={mockPosts} />
    </Suspense>
  );
};

export default SimpleBlogIndex;