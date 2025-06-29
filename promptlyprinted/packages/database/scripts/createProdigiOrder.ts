import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

interface ProdigiOrderItem {
  merchantReference: string;
  sku: string;
  copies: number;
  sizing: 'crop' | 'shrinkToFit';
  assets: {
    printArea: string;
  }[];
}

interface ProdigiOrder {
  shippingMethod: string;
  merchantReference: string;
  recipient: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      postalOrZipCode: string;
      countryCode: string;
      townOrCity: string;
      stateOrCounty?: string;
    };
  };
  items: ProdigiOrderItem[];
}

async function createProdigiOrder(
  imageUrl: string,
  sku: string,
  recipient: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      postalOrZipCode: string;
      countryCode: string;
      townOrCity: string;
      stateOrCounty?: string;
    };
  },
  merchantReference = `order_${Date.now()}`
): Promise<any> {
  const order: ProdigiOrder = {
    shippingMethod: 'standard',
    merchantReference,
    recipient,
    items: [
      {
        merchantReference: `item_${Date.now()}`,
        sku,
        copies: 1,
        sizing: 'shrinkToFit', // or 'crop' depending on your needs
        assets: [
          {
            printArea: imageUrl,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch('https://api.prodigi.com/v4.0/orders', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PRODIGI_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Prodigi order:', error);
    throw error;
  }
}

// Example usage:
/*
const recipient = {
  name: "John Doe",
  address: {
    line1: "123 Main St",
    postalOrZipCode: "12345",
    countryCode: "US",
    townOrCity: "New York"
  }
};

const imageUrl = "https://example.com/my-design.png";
const sku = "GLOBAL-TEE-GIL-5000"; // Classic T-Shirt

createProdigiOrder(imageUrl, sku, recipient)
  .then(response => console.log('Order created:', response))
  .catch(error => console.error('Error:', error));
*/

export { createProdigiOrder };
export type { ProdigiOrder, ProdigiOrderItem };
