import { auth } from '@clerk/nextjs/server';
import { basehub, fragmentOn } from 'basehub';
import { Transaction } from '@basehub/mutation-api-helpers';
import { NextResponse } from 'next/server';

console.log('🚀 CMS Route file loaded');

// BaseHub client with admin token for mutations
const basehubWithAdmin = basehub({
  token: process.env.BASEHUB_ADMIN_TOKEN || process.env.BASEHUB_TOKEN,
});

// Temporary in-memory storage for demo purposes
// In a real implementation, this would use BaseHub's mutation API
let tempStorage: { [key: string]: any[] } = {
  posts: [],
  authors: [],
  categories: [],
  legalPages: []
};

// Helper function to clean image URLs
const cleanImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  // Remove ALL angle brackets from anywhere in the string
  const cleaned = url.replace(/[<>]/g, '');
  console.log(`🧹 Cleaned URL: "${url}" -> "${cleaned}"`);
  return cleaned;
};

// Helper functions for BaseHub Transaction API
const getComponentId = (type: string): string => {
  // Map your content types to their BaseHub component IDs from the provided info
  switch (type) {
    case 'PostsItem':
      return '098a9d008bfe005e8f90b'; // Your blog post component ID
    case 'AuthorsItem':
      return '6a9d63d4ab4c97c85285b'; // AuthorsItem component ID
    case 'CategoriesItem':
      return '686372d34543bd3d6cf0f'; // CategoriesItem component ID 
    case 'LegalPagesItem':
      return 'd28899dce992adbba4c73'; // LegalPagesItem component ID
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};

const createValueObject = (type: string, data: any) => {
  switch (type) {
    case 'PostsItem':
      return {
        description: {
          type: 'text',
          value: data.description || ''
        },
        body: {
          type: 'rich-text',
          value: {
            format: 'markdown',
            value: data.body || ''
          }
        },
        date: {
          type: 'date',
          value: data.date || new Date().toISOString()
        },
        image: {
          type: 'media',
          value: data.image ? {
            url: cleanImageUrl(data.image),
            fileName: data.imageFileName || 'blog-image.jpg',
            alt: data.imageAlt || data.title || 'Blog post image'
          } : {
            url: cleanImageUrl('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'),
            fileName: 'default-blog.jpg',
            alt: 'Default blog post image'
          }
        },
        authors: {
          type: 'reference',
          value: (() => {
            const authors = data.authors || ['gitvyQQRn1f5ycC3fxkPJ'];
            console.log('👥 Authors for post:', authors, authors.length === 1 && authors[0] === 'gitvyQQRn1f5ycC3fxkPJ' ? '(using default Nathan G)' : '(from request)');
            return authors;
          })()
        },
        categories: {
          type: 'reference',
          value: []
        }
      };
    case 'AuthorsItem':
      return {
        xUrl: {
          type: 'text',
          value: data.xUrl || ''
        }
      };
    case 'CategoriesItem':
      return {}; // Categories only have title, no additional fields
    case 'LegalPagesItem':
      return {
        description: {
          type: 'text',
          value: data.description || ''
        },
        body: {
          type: 'rich-text',
          value: {
            format: 'markdown',
            value: data.body || ''
          }
        }
      };
    default:
      return {};
  }
};

const createUpdateValueObject = (data: any) => {
  const valueObj: any = {};
  
  if (data.description) {
    valueObj.description = {
      type: 'text',
      value: data.description
    };
  }
  
  if (data.body) {
    valueObj.body = {
      type: 'rich-text',
      value: {
        format: 'markdown',
        value: data.body?.plainText || data.body
      }
    };
  }
  
  if (data.date) {
    valueObj.date = {
      type: 'date',
      value: data.date
    };
  }
  
  if (data.xUrl !== undefined) {
    valueObj.xUrl = {
      type: 'text',
      value: data.xUrl
    };
  }
  
  if (data.image) {
    valueObj.image = {
      type: 'media',
      value: {
        url: cleanImageUrl(data.image),
        fileName: data.imageFileName || 'blog-image.jpg',
        alt: data.imageAlt || data.title || 'Blog post image'
      }
    };
  }
  
  if (data.authors) {
    valueObj.authors = {
      type: 'reference',
      value: data.authors
    };
  }
  
  if (data.categories) {
    valueObj.categories = {
      type: 'reference',
      value: data.categories
    };
  }
  
  return valueObj;
};

// BaseHub mutation operations - using correct Transaction API
const createBaseHubBlock = async (parentId: string, type: string, data: any) => {
  console.log('Creating BaseHub block:', { parentId, type, data });
  
  try {
    // Create proper transaction object using mutation-api-helpers
    const transaction: Transaction = {
      autoCommit: `Created ${type}: ${data._title || data.title}`,
      operations: [
        {
          type: 'create',
          parentId: parentId,
          data: {
            type: 'instance',
            title: data._title || data.title,
            mainComponentId: getComponentId(type), // Function to get correct component ID
            value: createValueObject(type, data)
          }
        }
      ]
    };
    
    console.log('🔍 TOKEN DEBUG:');
    console.log('Token exists:', !!process.env.BASEHUB_TOKEN);
    console.log('Token starts with:', process.env.BASEHUB_TOKEN?.substring(0, 15));
    console.log('Token length:', process.env.BASEHUB_TOKEN?.length);
    console.log('Full token (first 50 chars):', process.env.BASEHUB_TOKEN?.substring(0, 50));
    
    // Use the correct BaseHub transaction mutation
    const mutation = `
      mutation Transaction($data: String!, $autoCommit: String) {
        transaction(data: $data, autoCommit: $autoCommit)
      }
    `;
    
    const valueObject = createValueObject(type, data);
    console.log('📋 Value object created:', JSON.stringify(valueObject, null, 2));
    
    const transactionData = [{
      type: "create",
      parentId: parentId,
      data: {
        type: "instance",
        mainComponentId: getComponentId(type),
        title: data._title || data.title,
        value: valueObject
      }
    }];
    
    console.log('📤 Transaction data:', JSON.stringify(transactionData, null, 2));
    
    const variables = {
      data: JSON.stringify(transactionData),
      autoCommit: `Created ${type}: ${data._title || data.title}`
    };
    
    console.log('🚀 Sending to BaseHub:', { variables });
    
    // Use fetch to call BaseHub GraphQL API directly
    console.log('📤 Sending mutation to BaseHub...');
    const response = await fetch('https://api.basehub.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BASEHUB_ADMIN_TOKEN || process.env.BASEHUB_TOKEN}`
      },
      body: JSON.stringify({
        query: mutation,
        variables
      })
    });
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    
    console.log('✅ BaseHub mutation response:', JSON.stringify(result, null, 2));
    
    // Check for HTTP errors first
    if (!response.ok) {
      console.error('❌ BaseHub HTTP Error:', response.status, result);
      throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(result)}`);
    }
    
    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('❌ BaseHub GraphQL Errors:');
      result.errors.forEach((error: any, index: number) => {
        console.error(`  Error ${index + 1}:`, {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions
        });
      });
      const errorMessages = result.errors.map((e: any) => e.message).join(', ');
      throw new Error(`GraphQL Error: ${errorMessages}`);
    }
    
    // Check for data existence
    if (!result.data) {
      console.error('❌ No data in response:', result);
      throw new Error('No data returned from BaseHub');
    }
    
    // Check for successful transaction
    if (result.data.transaction) {
      console.log('✅ BaseHub transaction successful:', result.data.transaction);
      
      // Add a small delay to verify the content was actually created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, id: result.data.transaction };
    } else {
      console.error('❌ BaseHub unexpected response format:');
      console.error('  Full result:', result);
      console.error('  Data object:', result.data);
      throw new Error('Transaction failed - no transaction ID returned');
    }
  } catch (error: any) {
    console.error('❌ Full error details:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    console.error('  Response data:', error.response?.data || 'No response data');
    console.error('  Error object:', error);
    
    // Fallback to temporary storage if BaseHub mutation fails
    const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newItem = { ...data, id };
    
    switch (type) {
      case 'PostsItem':
        tempStorage.posts = tempStorage.posts || [];
        tempStorage.posts.push(newItem);
        break;
      case 'AuthorsItem':
        tempStorage.authors = tempStorage.authors || [];
        tempStorage.authors.push(newItem);
        break;
      case 'CategoriesItem':
        tempStorage.categories = tempStorage.categories || [];
        tempStorage.categories.push(newItem);
        break;
      case 'LegalPagesItem':
        tempStorage.legalPages = tempStorage.legalPages || [];
        tempStorage.legalPages.push(newItem);
        break;
    }
    
    return { success: true, id, fallback: true };
  }
};

const updateBaseHubBlock = async (blockId: string, data: any) => {
  console.log('Updating BaseHub block:', { blockId, data });
  
  try {
    // Use the same fetch-based approach as create operation
    const mutation = `
      mutation Transaction($data: String!, $autoCommit: String) {
        transaction(data: $data, autoCommit: $autoCommit)
      }
    `;
    
    const valueObject = createUpdateValueObject(data);
    console.log('📋 Update value object created:', JSON.stringify(valueObject, null, 2));
    
    const transactionData = [{
      type: "update",
      id: blockId,
      title: data._title || data.title,
      value: valueObject
    }];
    
    console.log('📤 Update transaction data:', JSON.stringify(transactionData, null, 2));
    
    const variables = {
      data: JSON.stringify(transactionData),
      autoCommit: `Updated block: ${data._title || data.title || blockId}`
    };
    
    console.log('🚀 Sending update to BaseHub:', { variables });
    
    // Use fetch to call BaseHub GraphQL API directly
    const response = await fetch('https://api.basehub.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BASEHUB_ADMIN_TOKEN || process.env.BASEHUB_TOKEN}`
      },
      body: JSON.stringify({
        query: mutation,
        variables
      })
    });
    
    console.log('📨 Update response status:', response.status);
    const result = await response.json();
    console.log('✅ BaseHub update response:', JSON.stringify(result, null, 2));
    
    // Check for HTTP errors first
    if (!response.ok) {
      console.error('❌ BaseHub HTTP Error:', response.status, result);
      throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(result)}`);
    }
    
    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('❌ BaseHub GraphQL Errors:', result.errors);
      const errorMessages = result.errors.map((e: any) => e.message).join(', ');
      throw new Error(`GraphQL Error: ${errorMessages}`);
    }
    
    // Check for data existence
    if (!result.data) {
      console.error('❌ No data in response:', result);
      throw new Error('No data returned from BaseHub');
    }
    
    // Check for successful transaction
    if (result.data.transaction) {
      console.log('✅ BaseHub update successful:', result.data.transaction);
      return { success: true, id: result.data.transaction };
    } else {
      console.error('❌ BaseHub unexpected response format:', result);
      throw new Error('Update failed - no transaction ID returned');
    }
  } catch (error: any) {
    console.error('❌ BaseHub update error:', error);
    
    // Fallback to temporary storage if BaseHub mutation fails
    Object.keys(tempStorage).forEach(key => {
      const items = tempStorage[key];
      const index = items.findIndex(item => item.id === blockId);
      if (index !== -1) {
        tempStorage[key][index] = { ...items[index], ...data };
      }
    });
    
    return { success: true, fallback: true };
  }
};

const deleteBaseHubBlock = async (blockId: string) => {
  console.log('🗑️ SERVER: Deleting BaseHub block:', { blockId });
  
  try {
    // Use the same fetch-based approach as create/update operations
    const mutation = `
      mutation Transaction($data: String!, $autoCommit: String) {
        transaction(data: $data, autoCommit: $autoCommit)
      }
    `;
    
    const transactionData = [{
      type: "delete",
      id: blockId
    }];
    
    console.log('📤 Delete transaction data:', JSON.stringify(transactionData, null, 2));
    
    const variables = {
      data: JSON.stringify(transactionData),
      autoCommit: `Deleted block: ${blockId}`
    };
    
    console.log('🚀 Sending delete to BaseHub:', { variables });
    
    // Use fetch to call BaseHub GraphQL API directly
    const response = await fetch('https://api.basehub.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BASEHUB_ADMIN_TOKEN || process.env.BASEHUB_TOKEN}`
      },
      body: JSON.stringify({
        query: mutation,
        variables
      })
    });
    
    console.log('📨 Delete response status:', response.status);
    const result = await response.json();
    console.log('✅ BaseHub delete response:', JSON.stringify(result, null, 2));
    
    // Check for HTTP errors first
    if (!response.ok) {
      console.error('❌ BaseHub HTTP Error:', response.status, result);
      throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(result)}`);
    }
    
    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('❌ BaseHub GraphQL Errors:', result.errors);
      const errorMessages = result.errors.map((e: any) => e.message).join(', ');
      throw new Error(`GraphQL Error: ${errorMessages}`);
    }
    
    // Check for data existence
    if (!result.data) {
      console.error('❌ No data in response:', result);
      throw new Error('No data returned from BaseHub');
    }
    
    // Check for successful transaction
    if (result.data.transaction) {
      console.log('✅ BaseHub delete successful:', result.data.transaction);
      return { success: true, id: result.data.transaction };
    } else {
      console.error('❌ BaseHub unexpected response format:', result);
      throw new Error('Delete failed - no transaction ID returned');
    }
  } catch (error: any) {
    console.error('❌ BaseHub delete error:', error);
    
    // Fallback to temporary storage if BaseHub mutation fails
    Object.keys(tempStorage).forEach(key => {
      tempStorage[key] = tempStorage[key].filter(item => item.id !== blockId);
    });
    
    return { success: true, fallback: true };
  }
};

const commitChanges = async (message: string) => {
  console.log('Committing changes to BaseHub:', { message });
  
  // With autoCommit in mutations, explicit commits may not be needed
  // But we keep this for compatibility
  return { success: true };
};

// Define fragments for reusable parts of queries
const imageFragment = fragmentOn('BlockImage', {
  url: true,
  width: true,
  height: true,
  alt: true,
  blurDataURL: true,
});

const postFragment = fragmentOn('PostsItem', {
  _slug: true,
  _title: true,
  authors: {
    items: {
      _slug: true,
      _title: true,
      avatar: imageFragment,
      xUrl: true,
    },
  },
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
  categories: {
    items: {
      _slug: true,
      _title: true,
    },
  },
  date: true,
  description: true,
  image: imageFragment,
});

const legalPostFragment = fragmentOn('LegalPagesItem', {
  _slug: true,
  _title: true,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
  description: true,
});

// Define queries using fragments
const queries = {
  'blog/posts': {
    blog: {
      posts: {
        items: {
          _id: true,
          _slug: true,
          _title: true,
          description: true,
          date: true,
        },
      },
    },
  },
  'blog/authors': {
    blog: {
      authors: {
        items: {
          _id: true,
          _slug: true,
          _title: true,
          xUrl: true,
        },
      },
    },
  },
  'blog/categories': {
    blog: {
      categories: {
        items: {
          _id: true,
          _slug: true,
          _title: true,
        },
      },
    },
  },
  'legal/pages': {
    legalPages: {
      items: legalPostFragment,
    },
  },
};

async function fetchFromBasehub(path: string, options: RequestInit = {}) {
  const pathSegments = path.replace(/^\//, '').split('/');
  const contentType = pathSegments
    .slice(0, 2)
    .join('/') as keyof typeof queries;

  if (options.method === 'GET' && queries[contentType]) {
    try {
      console.log('🔍 Querying BaseHub for:', contentType);
      const data = await basehubWithAdmin.query(queries[contentType]);
      console.log('✅ BaseHub raw response:', JSON.stringify(data, null, 2));
      
      const basehubData = transformResponse(contentType, data);
      console.log('📋 Transformed BaseHub data:', basehubData.length, 'items');
      
      // Merge with temporary storage
      const tempData = getTempData(contentType);
      console.log('📦 Temp data to merge:', tempData.length, 'items');
      
      const combined = [...basehubData, ...tempData];
      console.log('🔗 Combined data returned:', combined.length, 'total items');
      return combined;
    } catch (error) {
      console.error('❌ BaseHub Query Error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        contentType,
        query: queries[contentType]
      });
      
      // Try to return just the temporary data without mock fallback
      const tempData = getTempData(contentType);
      console.log('📦 Falling back to temp data only:', tempData.length, 'items');
      return tempData;
    }
  }

  throw new Error(`Invalid operation for path: ${path}`);
}

function getTempData(contentType: keyof typeof queries) {
  switch (contentType) {
    case 'blog/posts':
      return tempStorage.posts?.map(post => ({
        id: post.id,
        title: post._title || post.title,
        description: post.description,
        date: post.date,
        image: post.image,
        authors: [],
        categories: [],
        body: post.body?.plainText || post.body || '',
      })) || [];
    case 'blog/authors':
      return tempStorage.authors?.map(author => ({
        id: author.id,
        title: author._title || author.title,
        avatar: author.avatar?.url || author.avatar,
        xUrl: author.xUrl,
      })) || [];
    case 'blog/categories':
      return tempStorage.categories?.map(category => ({
        id: category.id,
        title: category._title || category.title,
      })) || [];
    case 'legal/pages':
      return tempStorage.legalPages?.map(page => ({
        id: page.id,
        title: page._title || page.title,
        description: page.description,
        body: page.body?.plainText || page.body || '',
      })) || [];
    default:
      return [];
  }
}

function transformResponse(contentType: keyof typeof queries, response: any) {
  switch (contentType) {
    case 'blog/posts':
      return (response?.blog?.posts?.items || []).map((post: any) => ({
        id: post._id,
        title: post._title,
        description: post.description,
        date: post.date,
        image: post.image?.url,
        authors:
          post.authors?.items?.map((author: any) => ({
            id: author._slug,
            title: author._title,
          })) || [],
        categories:
          post.categories?.items?.map((category: any) => ({
            id: category._slug,
            title: category._title,
          })) || [],
        body: post.body?.plainText || '',
      }));
    case 'blog/authors':
      return (response?.blog?.authors?.items || []).map((author: any) => ({
        id: author._id,
        title: author._title,
        avatar: author.avatar?.url,
        xUrl: author.xUrl,
      }));
    case 'blog/categories':
      return (response?.blog?.categories?.items || []).map((category: any) => ({
        id: category._id,
        title: category._title,
      }));
    case 'legal/pages':
      return (response?.legalPages?.items || []).map((page: any) => ({
        id: page._slug,
        title: page._title,
        description: page.description,
        body: page.body?.plainText || '',
      }));
    default:
      return [];
  }
}

function getMockData(contentType: keyof typeof queries) {
  switch (contentType) {
    case 'blog/posts':
      return [
        {
          id: 'sample-post',
          title: 'Sample Post',
          description: 'This is a sample post',
          date: new Date().toISOString(),
          image: 'https://picsum.photos/800/400',
          authors: [
            {
              id: 'john-doe',
              title: 'John Doe',
            },
          ],
          categories: [
            {
              id: 'general',
              title: 'General',
            },
          ],
          body: 'Sample content',
        },
      ];
    case 'blog/authors':
      return [
        {
          id: 'john-doe',
          title: 'John Doe',
          avatar: 'https://picsum.photos/200/200',
          xUrl: 'https://x.com/johndoe',
        },
      ];
    case 'blog/categories':
      return [
        {
          id: 'general',
          title: 'General',
        },
      ];
    case 'legal/pages':
      return [
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          description: 'Our terms of service',
          body: 'Sample terms of service content',
        },
      ];
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.BASEHUB_TOKEN) {
      return NextResponse.json(
        { error: 'BASEHUB_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const { route } = await params;
    const path = `/${route.join('/')}`;
    const data = await fetchFromBasehub(path, { method: 'GET' });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API error:', {
      path: 'unknown',
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests (Create operations).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { route } = await params;
    const path = `/${route.join('/')}`;
    const body = await request.json();
    
    // Determine the content type and parent
    const pathSegments = path.replace(/^\//, '').split('/');
    const contentType = pathSegments.slice(0, 2).join('/');
    
    let result;
    
    switch (contentType) {
      case 'blog/posts':
        console.log('📝 Creating blog post with data:', body);
        console.log('🖼️ Raw image from body.image:', body.image);
        console.log('🖼️ Image type:', typeof body.image);
        result = await createBaseHubBlock('a509dd9aab04730e06088', 'PostsItem', {
          _title: body.title,
          description: body.description,
          body: body.body,
          date: body.date || new Date().toISOString(),
          image: cleanImageUrl(body.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'),
          imageFileName: body.imageFileName || 'blog-image.jpg',
          imageAlt: body.imageAlt || body.title || 'Blog post image',
          authors: body.authors || ['gitvyQQRn1f5ycC3fxkPJ'], // Include authors or default to Nathan G
        });
        break;
        
      case 'blog/authors':
        result = await createBaseHubBlock('7e25ad2d3a6858416cc03', 'AuthorsItem', {
          _title: body.title,
          xUrl: body.xUrl,
          _slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, '-') || `author-${Date.now()}`
        });
        break;
        
      case 'blog/categories':
        result = await createBaseHubBlock('bc838b21983025e4787e8', 'CategoriesItem', {
          _title: body.title,
          _slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, '-') || `category-${Date.now()}`
        });
        break;
        
      case 'legal/pages':
        result = await createBaseHubBlock('4fb1d29811dd190f056f2', 'LegalPagesItem', {
          _title: body.title,
          description: body.description,
          body: { plainText: body.body || '' },
          _slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, '-') || `page-${Date.now()}`
        });
        break;
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    // Commit the changes
    await commitChanges(`Created ${contentType}: ${body.title}`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle PUT requests (Update operations).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { route } = await params;
    const path = `/${route.join('/')}`;
    const body = await request.json();
    
    // Get the ID from the path (e.g., /blog/posts/some-id)
    const pathSegments = path.replace(/^\//, '').split('/');
    const blockId = pathSegments[pathSegments.length - 1];
    const contentType = pathSegments.slice(0, 2).join('/');
    
    let updateData;
    
    switch (contentType) {
      case 'blog/posts':
        updateData = {
          _title: body.title,
          description: body.description,
          body: { plainText: body.body || '' },
          date: body.date
        };
        break;
        
      case 'blog/authors':
        updateData = {
          _title: body.title,
          xUrl: body.xUrl
        };
        break;
        
      case 'blog/categories':
        updateData = {
          _title: body.title
        };
        break;
        
      case 'legal/pages':
        updateData = {
          _title: body.title,
          description: body.description,
          body: { plainText: body.body || '' }
        };
        break;
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    const result = await updateBaseHubBlock(blockId, updateData);
    
    // Commit the changes
    await commitChanges(`Updated ${contentType}: ${body.title}`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle DELETE requests (Delete operations).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  console.log('🗑️ SERVER: DELETE endpoint called');
  const session = await auth();
  if (!session?.userId) {
    console.log('❌ SERVER: Unauthorized DELETE request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { route } = await params;
    const path = `/${route.join('/')}`;
    console.log('🛣️ SERVER: DELETE path:', path);
    
    // Get the ID from the path (e.g., /blog/posts/some-id) 
    const pathSegments = path.replace(/^\//, '').split('/');
    const contentType = pathSegments.slice(0, 2).join('/');
    const blockId = pathSegments[pathSegments.length - 1];
    
    console.log('📂 SERVER: Content type:', contentType);
    console.log('🆔 SERVER: Block ID to delete:', blockId);
    console.log('📍 SERVER: Path segments:', pathSegments);
    
    const result = await deleteBaseHubBlock(blockId);
    console.log('📋 SERVER: Delete result:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('DELETE API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
