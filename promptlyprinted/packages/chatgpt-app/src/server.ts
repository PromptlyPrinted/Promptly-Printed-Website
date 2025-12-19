/**
 * PromptlyPrinted ChatGPT App - MCP Server
 * 
 * This is a simplified Express server that handles MCP-style tool calls.
 * Note: The actual MCP SDK integration requires specific setup with ChatGPT Apps.
 */

import express, { Request, Response, Application } from 'express';
import cors from 'cors';

// Import tool handlers
import { handleGenerateDesign, generateDesignInputSchema, GenerateDesignInput } from './tools/generate-design.js';
import { handleListProducts, listProductsInputSchema, ListProductsInput } from './tools/list-products.js';
import { handleConfigureApparel, configureApparelInputSchema, ConfigureApparelInput } from './tools/configure-apparel.js';
import { handleApplyPromo, applyPromoInputSchema, ApplyPromoInput } from './tools/apply-promo.js';
import { handleCheckout, checkoutInputSchema, CheckoutInput } from './tools/checkout.js';

const PORT = process.env.PORT || 3100;
const PROMPTLY_PRINTED_URL = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Create Express app
const app: Application = express();
app.use(cors());
app.use(express.json());

// Tool definitions for MCP
const TOOLS = {
  generate_design: {
    name: 'generate_design',
    description: 'Generate an AI-powered apparel design or apply a user\'s existing image to products.',
    inputSchema: generateDesignInputSchema,
    handler: handleGenerateDesign,
  },
  list_products: {
    name: 'list_products',
    description: 'List available apparel products from PromptlyPrinted.',
    inputSchema: listProductsInputSchema,
    handler: handleListProducts,
  },
  configure_apparel: {
    name: 'configure_apparel',
    description: 'Configure a product with a design, color, and size.',
    inputSchema: configureApparelInputSchema,
    handler: handleConfigureApparel,
  },
  apply_promo_code: {
    name: 'apply_promo_code',
    description: 'Validate and apply a promotional discount code.',
    inputSchema: applyPromoInputSchema,
    handler: handleApplyPromo,
  },
  checkout: {
    name: 'checkout',
    description: 'Generate checkout link for the configured product.',
    inputSchema: checkoutInputSchema,
    handler: handleCheckout,
  },
};

// MCP endpoint - handles tool calls (JSON-RPC 2.0 compliant)
app.post('/mcp', async (req: Request, res: Response) => {
  try {
    const { jsonrpc, id, method, params } = req.body;
    
    // Check for JSON-RPC 2.0
    if (jsonrpc !== '2.0') {
      // Keep it somewhat flexible for now but log it
      console.warn('Received non-JSON-RPC 2.0 request');
    }

    if (method === 'initialize') {
      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            prompts: {},
            resources: {},
          },
          serverInfo: {
            name: 'promptlyprinted-mcp',
            version: '1.0.0',
          },
        }
      });
      return;
    }
    
    if (method === 'tools/list') {
      // Return list of available tools
      const tools = Object.values(TOOLS).map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: {
          type: 'object',
          properties: t.inputSchema,
        },
      }));
      res.json({ 
        jsonrpc: '2.0',
        id,
        result: { tools } 
      });
      return;
    }
    
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      const tool = TOOLS[name as keyof typeof TOOLS];
      
      if (!tool) {
        res.status(400).json({ 
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Unknown tool: ${name}` } 
        });
        return;
      }
      
      // Call the handler
      let result;
      switch (name) {
        case 'generate_design':
          result = await handleGenerateDesign(args as GenerateDesignInput);
          break;
        case 'list_products':
          result = await handleListProducts(args as ListProductsInput);
          break;
        case 'configure_apparel':
          result = await handleConfigureApparel(args as ConfigureApparelInput);
          break;
        case 'apply_promo_code':
          result = await handleApplyPromo(args as ApplyPromoInput);
          break;
        case 'checkout':
          result = await handleCheckout(args as CheckoutInput);
          break;
        default:
          res.status(400).json({ 
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${name}` } 
          });
          return;
      }
      
      res.json({
        jsonrpc: '2.0',
        id,
        result
      });
      return;
    }

    // Default response for other methods
    res.json({
      jsonrpc: '2.0',
      id,
      result: {
        name: 'promptlyprinted',
        version: '1.0.0',
        tools: Object.keys(TOOLS),
      }
    });
    
  } catch (error) {
    console.error('MCP error:', error);
    res.status(500).json({ 
      jsonrpc: '2.0',
      id: req.body.id,
      error: { 
        code: -32603, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }
    });
  }
});

// SSE endpoint for real-time updates
app.get('/mcp', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connection event in JSON-RPC format or simple data
  res.write(`data: ${JSON.stringify({ type: 'connected', server: 'promptlyprinted' })}\n\n`);
  
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);
  
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'promptlyprinted-chatgpt-app' });
});

// Widget template endpoint
app.get('/widget', (_req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptlyPrinted Design</title>
  <script src="${PROMPTLY_PRINTED_URL}/chatgpt-widget/widget.js" defer></script>
  <link rel="stylesheet" href="${PROMPTLY_PRINTED_URL}/chatgpt-widget/widget.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>
  `.trim());
});

// --- OAuth & DCR Implementation ---

// OpenID Configuration Discovery (Required by ChatGPT Connectors)
app.get('/.well-known/openid-configuration', (_req: Request, res: Response) => {
  res.json({
    issuer: `${PROMPTLY_PRINTED_URL}/api/auth`,
    authorization_endpoint: `${PROMPTLY_PRINTED_URL}/api/auth/authorize`,
    token_endpoint: `${PROMPTLY_PRINTED_URL}/api/auth/token`,
    registration_endpoint: `${PROMPTLY_PRINTED_URL}/api/auth/register`,
    jwks_uri: `${PROMPTLY_PRINTED_URL}/api/auth/jwks`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
    claims_supported: ["sub", "email", "name"]
  });
});

// OAuth Protected Resource Metadata
app.get('/.well-known/oauth-protected-resource', (_req: Request, res: Response) => {
  res.json({
    resource: `${PROMPTLY_PRINTED_URL}/mcp`,
    authorization_servers: [
      `${PROMPTLY_PRINTED_URL}/api/auth`
    ]
  });
});

// Dynamic Client Registration (RFC 7591)
app.post('/api/auth/register', (req: Request, res: Response) => {
  console.log('Dynamic Client Registration request:', req.body);
  
  // Minimal implementation: Return a stable client ID/secret for ChatGPT
  res.status(201).json({
    client_id: "chatgpt-connector-id",
    client_secret: "chatgpt-connector-secret",
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: req.body.client_name || "ChatGPT Connector",
    redirect_uris: req.body.redirect_uris,
    grant_types: ["authorization_code"],
    response_types: ["code"],
    token_endpoint_auth_method: "client_secret_post"
  });
});

// Mock Authorize Endpoint (for "None" or simple bypass)
app.get('/api/auth/authorize', (req: Request, res: Response) => {
  const { redirect_uri, state } = req.query;
  console.log('Authorize request:', { redirect_uri, state });
  
  if (redirect_uri) {
    const callbackUrl = new URL(redirect_uri as string);
    callbackUrl.searchParams.set('code', 'mock-auth-code');
    callbackUrl.searchParams.set('state', state as string);
    res.redirect(callbackUrl.toString());
  } else {
    res.status(400).send('Missing redirect_uri');
  }
});

// Mock Token Endpoint
app.post('/api/auth/token', (req: Request, res: Response) => {
  console.log('Token request:', req.body);
  
  res.json({
    access_token: "mock-access-token",
    token_type: "Bearer",
    expires_in: 3600,
    scope: "openid profile email"
  });
});

// Mock JWKS (Required by some OIDC clients)
app.get('/api/auth/jwks', (_req: Request, res: Response) => {
  res.json({ keys: [] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PromptlyPrinted ChatGPT App MCP Server running on port ${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export { app };
