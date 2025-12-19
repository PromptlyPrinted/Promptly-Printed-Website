/**
 * PromptlyPrinted ChatGPT App - MCP Server
 * 
 * This server implements the Model Context Protocol (MCP) to expose
 * PromptlyPrinted's apparel design capabilities to ChatGPT.
 */

import express from 'express';
import cors from 'cors';
import { McpServer, ResourceTemplate, ToolDefinition } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';

// Import tools
import { generateDesignTool, handleGenerateDesign } from './tools/generate-design.js';
import { listProductsTool, handleListProducts } from './tools/list-products.js';
import { configureApparelTool, handleConfigureApparel } from './tools/configure-apparel.js';
import { applyPromoTool, handleApplyPromo } from './tools/apply-promo.js';
import { checkoutTool, handleCheckout } from './tools/checkout.js';

const PORT = process.env.PORT || 3100;
const PROMPTLY_PRINTED_URL = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create MCP server
const server = new McpServer({
  name: 'promptlyprinted',
  version: '1.0.0',
});

// Register component template for the UI widget
server.resource(
  'component-template',
  new ResourceTemplate('component://widget', {
    list: async () => [{
      uri: 'component://widget',
      name: 'PromptlyPrinted Design Widget',
      mimeType: 'text/html+skybridge',
    }],
    complete: {},
    read: async () => ({
      contents: [{
        uri: 'component://widget',
        mimeType: 'text/html+skybridge',
        text: getWidgetTemplate(),
      }],
    }),
  })
);

// Register tools
server.tool(
  generateDesignTool.name,
  generateDesignTool.description,
  generateDesignTool.inputSchema,
  handleGenerateDesign
);

server.tool(
  listProductsTool.name,
  listProductsTool.description,
  listProductsTool.inputSchema,
  handleListProducts
);

server.tool(
  configureApparelTool.name,
  configureApparelTool.description,
  configureApparelTool.inputSchema,
  handleConfigureApparel
);

server.tool(
  applyPromoTool.name,
  applyPromoTool.description,
  applyPromoTool.inputSchema,
  handleApplyPromo
);

server.tool(
  checkoutTool.name,
  checkoutTool.description,
  checkoutTool.inputSchema,
  handleCheckout
);

// MCP endpoint
app.all('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  await server.connect(transport);
  
  // Handle the request body for non-SSE requests
  if (req.method === 'POST' && req.body) {
    await transport.handleMessage(req.body);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'promptlyprinted-chatgpt-app' });
});

// Widget template
function getWidgetTemplate(): string {
  return `
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
  `.trim();
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PromptlyPrinted ChatGPT App MCP Server running on port ${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export { server, app };
