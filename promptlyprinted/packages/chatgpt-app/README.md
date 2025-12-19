# PromptlyPrinted ChatGPT App

A ChatGPT App built with the OpenAI Apps SDK that allows users to create custom AI-designed apparel directly within ChatGPT conversations.

## Overview

This package provides:
- **MCP Server** - Exposes tools to ChatGPT for design generation, product selection, and checkout
- **UI Widget** - React components that render inside ChatGPT's iframe

## Features

- 🎨 **Accept User DALL-E Images** - Users can generate images in ChatGPT and apply them to products (saves your API credits!)
- 👕 **Product Catalog** - T-shirts and hoodies with color/size selection
- 🎁 **ChatGPT-Exclusive Promos** - 10-20% off codes for ChatGPT users
- 🛒 **External Checkout** - Redirects to promptlyprinted.com per OpenAI guidelines
- 📊 **Analytics Tracking** - Track conversions and user behavior

## Setup

### 1. Install Dependencies

```bash
cd packages/chatgpt-app
pnpm install

cd web
pnpm install
```

### 2. Development

**Run MCP Server:**
```bash
pnpm dev
```

**Run Widget (separate terminal):**
```bash
cd web
pnpm dev
```

### 3. Build for Production

```bash
pnpm build
cd web && pnpm build
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `generate_design` | Accept user images or redirect to website for design creation |
| `list_products` | Show available T-shirts and hoodies |
| `configure_apparel` | Select product, color, size |
| `apply_promo_code` | Validate ChatGPT-exclusive promo codes |
| `checkout` | Generate external checkout URL |

## Promo Codes

| Code | Discount |
|------|----------|
| `CHATGPT10` | 10% off |
| `FIRSTDESIGN` | 15% off |
| `BUNDLE20` | 20% off (2+ items) |

## Deployment

1. Deploy the MCP server to a publicly accessible HTTPS URL
2. Build and host the widget bundle
3. Enable ChatGPT Developer Mode
4. Add connector with your MCP URL

## Environment Variables

```env
PROMPTLY_PRINTED_URL=https://promptlyprinted.com
PORT=3100
```

## Analytics Events

See `src/utils/analytics.ts` for tracked events:
- `chatgpt_app_loaded`
- `chatgpt_design_from_dalle`
- `chatgpt_product_configured`
- `chatgpt_checkout_initiated`
- And more...
