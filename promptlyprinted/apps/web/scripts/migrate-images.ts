/**
 * Script to migrate base64 images to filesystem
 *
 * Run with: npx tsx scripts/migrate-images.ts
 *
 * Options:
 * - --delete: Delete base64 images after migration
 * - --dry-run: Show what would be migrated without actually doing it
 */

import { database } from '@repo/database';
import { storage } from '../lib/storage';

async function migrateImages(options: { delete?: boolean; dryRun?: boolean } = {}) {
  console.log('🔍 Finding base64 images in database...');

  const base64Images = await database.savedImage.findMany({
    where: {
      url: {
        startsWith: 'data:image'
      }
    },
    select: {
      id: true,
      url: true,
      name: true,
      userId: true,
      createdAt: true,
    },
  });

  console.log(`\n📊 Found ${base64Images.length} base64 images to migrate`);

  if (base64Images.length === 0) {
    console.log('✅ No images to migrate!');
    return;
  }

  // Calculate total size
  const totalSize = base64Images.reduce((acc, img) => acc + img.url.length, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`💾 Total base64 data size: ${totalSizeMB}MB`);

  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - No changes will be made\n');
    base64Images.slice(0, 5).forEach((img, i) => {
      console.log(`${i + 1}. ${img.name} (${img.id})`);
      console.log(`   Created: ${img.createdAt.toISOString()}`);
      console.log(`   Size: ${(img.url.length / 1024).toFixed(2)}KB`);
    });
    if (base64Images.length > 5) {
      console.log(`   ... and ${base64Images.length - 5} more`);
    }
    return;
  }

  console.log('\n🚀 Starting migration...\n');

  let migrated = 0;
  let failed = 0;

  for (const image of base64Images) {
    try {
      console.log(`Migrating: ${image.name} (${image.id})`);

      // Upload to filesystem
      const newUrl = await storage.uploadFromBase64(image.url, image.name);

      // Update database
      await database.savedImage.update({
        where: { id: image.id },
        data: { url: newUrl },
      });

      migrated++;
      console.log(`  ✅ Migrated to: ${newUrl}`);
    } catch (error) {
      failed++;
      console.error(`  ❌ Failed:`, error);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Freed ~${totalSizeMB}MB from database`);
}

// Alternative: Delete all base64 images
async function deleteBase64Images(dryRun = false) {
  console.log('🔍 Finding base64 images to delete...');

  const base64Images = await database.savedImage.findMany({
    where: {
      url: {
        startsWith: 'data:image'
      }
    },
    select: {
      id: true,
      name: true,
    },
  });

  console.log(`\n📊 Found ${base64Images.length} base64 images`);

  if (base64Images.length === 0) {
    console.log('✅ No images to delete!');
    return;
  }

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No changes will be made');
    return;
  }

  console.log('\n⚠️  WARNING: This will permanently delete all base64 images!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  const result = await database.savedImage.deleteMany({
    where: {
      url: {
        startsWith: 'data:image'
      }
    },
  });

  console.log(`✅ Deleted ${result.count} images`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  delete: args.includes('--delete'),
  dryRun: args.includes('--dry-run'),
  deleteOnly: args.includes('--delete-only'),
};

// Run
(async () => {
  try {
    if (options.deleteOnly) {
      await deleteBase64Images(options.dryRun);
    } else {
      await migrateImages(options);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
})();
