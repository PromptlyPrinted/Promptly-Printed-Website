import { type OrderStatus, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { createProdigiOrder } from './createProdigiOrder.js';

dotenv.config();
const prisma = new PrismaClient();

interface CustomizationOptions {
  imageFile: File;
  printArea: 'front' | 'back';
  sizing: 'crop' | 'shrinkToFit';
  position?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

interface OrderDetails {
  sku: string;
  quantity: number;
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
}

async function validateImage(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  // Check file type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG and PNG files are supported',
    };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Image must be smaller than 10MB',
    };
  }

  // Create image object to check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Check minimum dimensions (recommend at least 1500px for quality printing)
      if (img.width < 1500 || img.height < 1500) {
        resolve({
          valid: false,
          error:
            'Image should be at least 1500x1500 pixels for best print quality',
        });
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Failed to load image',
      });
    };

    img.src = url;
  });
}

async function uploadCustomization(
  customization: CustomizationOptions,
  orderId: string
): Promise<string> {
  // Validate the image first
  const validation = await validateImage(customization.imageFile);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', customization.imageFile);
  formData.append('printArea', customization.printArea);
  formData.append('sizing', customization.sizing);
  if (customization.position) {
    formData.append('position', JSON.stringify(customization.position));
  }
  formData.append('orderId', orderId);

  // Upload to your server/cloud storage
  // TODO: Replace with your actual upload endpoint
  const response = await fetch('/api/upload-design', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload design');
  }

  const { url } = await response.json();
  return url;
}

async function createCustomOrder(
  customization: CustomizationOptions,
  orderDetails: OrderDetails
): Promise<any> {
  try {
    // Generate order ID
    const orderId = `order_${Date.now()}`;

    // Upload the customization
    const designUrl = await uploadCustomization(customization, orderId);

    // Create the order with Prodigi
    const order = await createProdigiOrder(
      designUrl,
      orderDetails.sku,
      orderDetails.recipient,
      orderId
    );

    // Store order details in your database
    await prisma.order.create({
      data: {
        id: orderId,
        sku: orderDetails.sku,
        quantity: orderDetails.quantity,
        designUrl,
        printArea: customization.printArea,
        sizing: customization.sizing,
        position: customization.position
          ? JSON.stringify(customization.position)
          : null,
        status: 'CREATED' as OrderStatus,
        prodigiOrderId: order.id,
        // Add other relevant fields
      },
    });

    return order;
  } catch (error) {
    console.error('Error creating custom order:', error);
    throw error;
  }
}

// Frontend usage example:
/*
// In your product detail page component:
async function handleCustomization(event: FormEvent) {
  event.preventDefault();
  
  const imageFile = imageInput.files[0];
  const printArea = printAreaSelect.value;
  const sizing = sizingSelect.value;
  
  const customization: CustomizationOptions = {
    imageFile,
    printArea,
    sizing,
    position: {
      x: designerCanvas.position.x,
      y: designerCanvas.position.y,
      scale: designerCanvas.scale,
      rotation: designerCanvas.rotation
    }
  };

  const orderDetails: OrderDetails = {
    sku: product.sku,
    quantity: quantityInput.value,
    recipient: {
      name: nameInput.value,
      address: {
        line1: addressLine1Input.value,
        postalOrZipCode: zipInput.value,
        countryCode: countrySelect.value,
        townOrCity: cityInput.value
      }
    }
  };

  try {
    const order = await createCustomOrder(customization, orderDetails);
    // Handle successful order creation
    showSuccessMessage(order);
  } catch (error) {
    // Handle error
    showErrorMessage(error);
  }
}
*/

export { createCustomOrder, validateImage };
export type { CustomizationOptions, OrderDetails };
