const fs = require('fs');
const path = require('path');
const https = require('https');
const { PDFExtract } = require('pdf.js-extract');

interface ProductInfo {
  sizes: string[];
  colors: string[];
}

async function downloadPDF(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response: any) => {
      const chunks: Buffer[] = [];
      
      response.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      response.on('error', (err: Error) => {
        reject(err);
      });
    }).on('error', reject);
  });
}

async function extractProductInfo(pdfUrl: string): Promise<ProductInfo> {
  try {
    // Download the PDF
    console.log(`Downloading PDF from ${pdfUrl}...`);
    const pdfBuffer = await downloadPDF(pdfUrl);
    
    // Save PDF temporarily
    const tempPdfPath = path.join(__dirname, 'temp.pdf');
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Extract text from PDF
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(tempPdfPath);
    
    // Clean up temp file
    fs.unlinkSync(tempPdfPath);

    // Combine all text from all pages
    const fullText = data.pages.map((page: any) => 
      page.content.map((item: { str: string }) => item.str).join(' ')
    ).join(' ');

    console.log('Extracted text:', fullText);

    // Parse sizes - look for common size patterns
    const sizePattern = /\b(XS|S|M|L|XL|2XL|3XL|4XL|5XL|XXL|XXXL|XXXXL|XXXXXL)\b/g;
    const sizes = [...new Set(fullText.match(sizePattern) || [])] as string[];

    // Parse colors - look for color names followed by common descriptors
    const colorPattern = /\b(White|Black|Navy|Red|Grey|Gray|Blue|Green|Yellow|Purple|Pink|Brown|Orange|Maroon|Gold|Silver|Natural|Heather[a-zA-Z\s]*)\b/g;
    const colors = [...new Set(fullText.match(colorPattern) || [])] as string[];

    // If no sizes or colors found, use defaults
    const result: ProductInfo = {
      sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL', '2XL'],
      colors: colors.length > 0 ? colors : ['White', 'Black', 'Navy', 'Red']
    };

    console.log('Extracted product information:', result);
    return result;

  } catch (error) {
    console.error('Error extracting product info:', error);
    throw error;
  }
}

// Example usage:
async function main() {
  const pdfUrl = 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%205000.pdf';
  try {
    const productInfo = await extractProductInfo(pdfUrl);
    console.log('Product Information:', productInfo);
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractProductInfo };
module.exports.ProductInfo = {}; // TypeScript interface for type checking 