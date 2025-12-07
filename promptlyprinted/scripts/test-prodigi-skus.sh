#!/bin/bash

# Prodigi API Test Order - All SKUs
# This tests all product SKUs with valid sizes and colors

API_KEY="${PRODIGI_API_KEY:-YOUR_API_KEY_HERE}"

curl -X POST "https://api.sandbox.prodigi.com/v4.0/orders" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
  "shippingMethod": "Budget",
  "merchantReference": "TEST-ALL-SKUS-001",
  "recipient": {
    "name": "Test Order",
    "email": "test@example.com",
    "phoneNumber": "+441onal234567890",
    "address": {
      "line1": "123 Test Street",
      "postalOrZipCode": "SW1A 1AA",
      "countryCode": "GB",
      "townOrCity": "London"
    }
  },
  "items": [
    {
      "merchantReference": "item-1-TEE-SS-STTU755",
      "sku": "TEE-SS-STTU755",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "white",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-2-GLOBAL-TEE-BC-3413",
      "sku": "GLOBAL-TEE-BC-3413",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "vintage royal",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-3-GLOBAL-TT-GIL-64200",
      "sku": "GLOBAL-TT-GIL-64200",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-4-GLOBAL-TEE-GIL-64V00",
      "sku": "GLOBAL-TEE-GIL-64V00",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-5-GLOBAL-LS-TEE-GIL-2400",
      "sku": "GLOBAL-LS-TEE-GIL-2400",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-6-GLOBAL-TEE-GIL-64000",
      "sku": "GLOBAL-TEE-GIL-64000",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-7-GLOBAL-TEE-BC-6035",
      "sku": "GLOBAL-TEE-BC-6035",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-8-GLOBAL-BB-RS-4411",
      "sku": "GLOBAL-BB-RS-4411",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "white",
        "size": "6-12 months"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-9-GLOBAL-TEE-RS-3322",
      "sku": "GLOBAL-TEE-RS-3322",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "white",
        "size": "6-12 months"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-10-GLOBAL-TEE-GIL-64000B",
      "sku": "GLOBAL-TEE-GIL-64000B",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "black",
        "size": "7-8 years"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-11-SWEAT-AWD-JH030B",
      "sku": "SWEAT-AWD-JH030B",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "jet black",
        "size": "7-8 years"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-12-GLOBAL-HOOD-AWD-JH001",
      "sku": "GLOBAL-HOOD-AWD-JH001",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "jet black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-13-HOOD-AWD-JH001F",
      "sku": "HOOD-AWD-JH001F",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "jet black",
        "size": "m"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    },
    {
      "merchantReference": "item-14-HOOD-AWD-JH001B",
      "sku": "HOOD-AWD-JH001B",
      "copies": 1,
      "sizing": "fillPrintArea",
      "attributes": {
        "color": "jet black",
        "size": "7-8 years"
      },
      "assets": [
        {
          "printArea": "default",
          "url": "https://images.promptlyprinted.com/uploads/images/38467d26-5a50-4908-8fcb-c587e44d0343-checkout-image-1764865209134-300dpi.png"
        }
      ]
    }
  ]
}' | jq .
