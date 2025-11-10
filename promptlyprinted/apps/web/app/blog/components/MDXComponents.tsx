import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircleIcon, LightBulbIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Custom heading components with anchor links
const createHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  const Component = ({ children, ...props }: { children: ReactNode }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const sizes = {
      1: 'text-4xl md:text-5xl font-bold',
      2: 'text-3xl md:text-4xl font-bold',
      3: 'text-2xl md:text-3xl font-semibold',
      4: 'text-xl md:text-2xl font-semibold',
      5: 'text-lg md:text-xl font-semibold',
      6: 'text-base md:text-lg font-semibold'
    };

    return (
      <Tag 
        className={`${sizes[level]} text-slate-900 mb-6 mt-8 leading-tight`}
        {...props}
      >
        {children}
      </Tag>
    );
  };
  Component.displayName = `Heading${level}`;
  return Component;
};

// Custom paragraph component
const Paragraph = ({ children, ...props }: { children: ReactNode }) => (
  <p className="text-lg leading-relaxed text-slate-700 mb-6" {...props}>
    {children}
  </p>
);

// Custom link component
const CustomLink = ({ href, children, ...props }: { href?: string; children: ReactNode }) => {
  const isExternal = href?.startsWith('http');
  const isInternal = href?.startsWith('/');

  if (isInternal) {
    return (
      <Link
        href={href || '#'}
        className="text-teal-600 hover:text-teal-700 underline font-medium transition-colors"
        {...props}
      >
        {children}
      </Link>
    );
  }

  if (isExternal) {
    return (
      <a 
        href={href}
        className="text-teal-600 hover:text-teal-700 underline font-medium transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return <span {...props}>{children}</span>;
};

// Custom image component
const CustomImage = ({ src, alt, ...props }: { src?: string; alt?: string }) => {
  if (!src) return null;

  return (
    <motion.div 
      className="my-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <Image
        src={src}
        alt={alt || ''}
        width={800}
        height={400}
        className="w-full h-auto rounded-xl shadow-lg border border-slate-200"
        sizes="(max-width: 768px) 100vw, 800px"
        {...props}
      />
      {alt && (
        <p className="text-sm text-slate-600 text-center mt-3 italic">
          {alt}
        </p>
      )}
    </motion.div>
  );
};

// Custom list components
const UnorderedList = ({ children, ...props }: { children: ReactNode }) => (
  <ul className="list-none space-y-2 mb-6 ml-4" {...props}>
    {children}
  </ul>
);

const OrderedList = ({ children, ...props }: { children: ReactNode }) => (
  <ol className="list-decimal list-inside space-y-2 mb-6 ml-4 text-lg text-slate-700" {...props}>
    {children}
  </ol>
);

const ListItem = ({ children, ...props }: { children: ReactNode }) => (
  <li className="flex items-start gap-3 text-lg text-slate-700" {...props}>
    <CheckCircleIcon className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

// Custom blockquote component
const Blockquote = ({ children, ...props }: { children: ReactNode }) => (
  <blockquote 
    className="border-l-4 border-teal-500 bg-teal-50 p-6 my-8 italic text-lg text-slate-800 rounded-r-lg"
    {...props}
  >
    {children}
  </blockquote>
);

// Custom code components
const InlineCode = ({ children, ...props }: { children: ReactNode }) => (
  <code 
    className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono"
    {...props}
  >
    {children}
  </code>
);

const CodeBlock = ({ children, ...props }: { children: ReactNode }) => (
  <div className="my-8">
    <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto">
      <code className="font-mono text-sm" {...props}>
        {children}
      </code>
    </pre>
  </div>
);

// Custom callout components
interface CalloutProps {
  children: ReactNode;
  type?: 'info' | 'warning' | 'tip' | 'success';
}

const Callout = ({ children, type = 'info' }: CalloutProps) => {
  const configs = {
    info: {
      icon: InformationCircleIcon,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    tip: {
      icon: LightBulbIcon,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      iconColor: 'text-purple-500'
    },
    success: {
      icon: CheckCircleIcon,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500'
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border-l-4 p-6 my-8 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className={`${config.text} text-lg`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Custom table components
const Table = ({ children, ...props }: { children: ReactNode }) => (
  <div className="my-8 overflow-x-auto">
    <table className="min-w-full border border-slate-200 rounded-lg" {...props}>
      {children}
    </table>
  </div>
);

const TableHead = ({ children, ...props }: { children: ReactNode }) => (
  <thead className="bg-slate-50" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }: { children: ReactNode }) => (
  <tbody {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, ...props }: { children: ReactNode }) => (
  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors" {...props}>
    {children}
  </tr>
);

const TableHeader = ({ children, ...props }: { children: ReactNode }) => (
  <th className="px-4 py-3 text-left font-semibold text-slate-900" {...props}>
    {children}
  </th>
);

const TableCell = ({ children, ...props }: { children: ReactNode }) => (
  <td className="px-4 py-3 text-slate-700" {...props}>
    {children}
  </td>
);

// Horizontal rule
const HorizontalRule = (props: any) => (
  <hr className="my-12 border-t-2 border-slate-200" {...props} />
);

// Export MDX components
export const mdxComponents = {
  // Headings
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  
  // Text
  p: Paragraph,
  a: CustomLink,
  
  // Lists
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  
  // Media
  img: CustomImage,
  
  // Code
  code: InlineCode,
  pre: CodeBlock,
  
  // Other
  blockquote: Blockquote,
  hr: HorizontalRule,
  
  // Table
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeader,
  td: TableCell,
  
  // Custom components
  Callout,
};

export default mdxComponents;