import { tshirtDetails, type ProductDetails } from './2025_03_26_updateTshirtDetails.js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';
import puppeteer from 'puppeteer';

interface SizeChartData {
  sku: string;
  pdfUrl: string;
  sizes: Array<{
    name: string;
    measurements: Record<string, string>;
  }>;
}

async function downloadPDF(url: string, sku: string): Promise<string> {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filename = path.join(tempDir, `${sku}.pdf`);
  
  try {
    // Use puppeteer to handle any authentication/redirects
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to the PDF URL
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Get the final URL after any redirects
    const finalUrl = page.url();
    
    // Download the PDF using axios
    const response = await axios({
      method: 'GET',
      url: finalUrl,
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(filename, response.data);
    await browser.close();
    
    return filename;
  } catch (error) {
    console.error(`Error downloading PDF for ${sku}:`, error);
    throw error;
  }
}

async function parsePDFSizeChart(pdfPath: string): Promise<Array<{name: string; measurements: Record<string, string>}>> {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    // Extract text content
    const text = data.text;
    
    // Define regex patterns for different measurement formats
    const sizePatterns = [
      // Pattern for standard measurements (e.g., "S - Chest: 38")
      /(?<size>[XS|S|M|L|XL|XXL|XXXL]+)\s*[-:]?\s*(?:Chest|Width|Length|Shoulder|Sleeve)[^\d]*(?<measurement>\d+(?:\.\d+)?)/gi,
      
      // Pattern for numeric sizes (e.g., "Size 6 - 32 inches")
      /Size\s*(?<size>\d+)\s*[-:]?\s*(?<measurement>\d+(?:\.\d+)?)/gi,
      
      // Pattern for age-based sizes (e.g., "3-6M: length 24")
      /(?<size>\d+-\d+M|\d+M|Newborn)\s*[-:]?\s*(?:length|chest|width)[^\d]*(?<measurement>\d+(?:\.\d+)?)/gi
    ];

    const measurements: Record<string, Record<string, string>> = {};
    
    // Apply each pattern and collect measurements
    for (const pattern of sizePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const { size, measurement } = match.groups || {};
        if (size && measurement) {
          if (!measurements[size]) {
            measurements[size] = {};
          }
          
          // Determine measurement type from context
          let type = 'chest'; // default
          if (text.toLowerCase().includes('length')) type = 'length';
          if (text.toLowerCase().includes('shoulder')) type = 'shoulders';
          if (text.toLowerCase().includes('sleeve')) type = 'sleeves';
          
          measurements[size][type] = measurement;
        }
      }
    }

    // Convert to array format
    return Object.entries(measurements).map(([name, meas]) => ({
      name,
      measurements: meas
    }));
  } catch (error) {
    console.error(`Error parsing PDF:`, error);
    return [];
  }
}

async function fetchAllSizeCharts(): Promise<SizeChartData[]> {
  const sizeCharts: SizeChartData[] = [];

  for (const [sku, product] of Object.entries(tshirtDetails) as [string, ProductDetails][]) {
    try {
      console.log(`Processing ${sku}...`);
      
      // Download the PDF
      const pdfPath = await downloadPDF(product.pdfUrl, sku);
      
      // Parse the size chart
      const sizes = await parsePDFSizeChart(pdfPath);
      
      if (sizes.length > 0) {
        sizeCharts.push({
          sku,
          pdfUrl: product.pdfUrl,
          sizes
        });
        console.log(`Successfully processed ${sku} with ${sizes.length} sizes`);
      } else {
        console.warn(`No size data found for ${sku}`);
      }

      // Clean up the temporary PDF file
      fs.unlinkSync(pdfPath);
    } catch (error) {
      console.error(`Error processing ${sku}:`, error);
    }
  }

  return sizeCharts;
}

// Create a function to update the tshirt details with the new measurements
async function updateTshirtDetails(sizeCharts: SizeChartData[]) {
  const updatedDetails = { ...tshirtDetails };
  
  for (const chart of sizeCharts) {
    if (updatedDetails[chart.sku]) {
      updatedDetails[chart.sku].sizes = chart.sizes;
    }
  }
  
  // Write the updated details back to the file
  const filePath = path.join(__dirname, '2025_03_26_updateTshirtDetails.ts');
  const fileContent = `// Auto-generated file - DO NOT EDIT MANUALLY
${Object.entries(updatedDetails).map(([key, value]) => 
  `export const ${key} = ${JSON.stringify(value, null, 2)};`
).join('\n\n')}
`;
  
  fs.writeFileSync(filePath, fileContent);
}

// Run the script
fetchAllSizeCharts()
  .then(async sizeCharts => {
    // Save the raw results to a JSON file
    fs.writeFileSync(
      path.join(__dirname, 'sizeCharts.json'),
      JSON.stringify(sizeCharts, null, 2)
    );
    
    // Update the tshirt details with the new measurements
    await updateTshirtDetails(sizeCharts);
    
    console.log('Size charts have been fetched and saved, and T-shirt details have been updated.');
  })
  .catch(error => {
    console.error('Error fetching size charts:', error);
    process.exit(1);
  }); 