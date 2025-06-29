import cron from 'node-cron';
import { updateProductPrices } from './cronUpdateProducts.js';

console.log('Starting price update cron service...');

// Keep track of whether a job is running
let isJobRunning = false;

async function runUpdate() {
  if (isJobRunning) {
    console.log('Previous job still running, skipping...');
    return;
  }

  console.log(`Running price update at ${new Date().toISOString()}`);
  isJobRunning = true;

  try {
    await updateProductPrices();
    console.log('Price update completed successfully');
  } catch (error) {
    console.error('Error in price update cron job:', error);
  } finally {
    isJobRunning = false;
  }
}

// Run immediately on startup
console.log('Running initial price update...');
runUpdate();

// Schedule for midnight every day
cron.schedule('0 0 * * *', runUpdate);

// Optional heartbeat or logging
setInterval(() => {
  console.log('Cron service running...');
}, 60000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Stopping cron service...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Stopping cron service...');
  process.exit(0);
});
