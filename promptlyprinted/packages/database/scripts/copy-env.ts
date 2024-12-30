import { copyFileSync } from 'fs';
import { join } from 'path';

const sourceEnvPath = join(process.cwd(), '..', '..', 'apps', 'api', '.env');
const targetEnvPath = join(process.cwd(), '.env');

try {
  copyFileSync(sourceEnvPath, targetEnvPath);
  console.log('Successfully copied environment variables from API app');
} catch (error) {
  console.error('Error copying environment variables:', error);
  process.exit(1);
} 