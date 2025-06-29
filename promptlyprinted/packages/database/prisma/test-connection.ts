import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('Testing source database connection...');
  const sourceClient = new PrismaClient({
    datasourceUrl: process.env.SOURCE_DATABASE_URL + '&connect_timeout=30',
  });

  try {
    await sourceClient.$connect();
    console.log('Successfully connected to source database!');

    // Try a simple query
    const count = await sourceClient.category.count();
    console.log(`Found ${count} categories in source database`);
  } catch (error) {
    console.error('Error connecting to source database:', error);
  } finally {
    await sourceClient.$disconnect();
  }

  console.log('\nTesting target database connection...');
  const targetClient = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    await targetClient.$connect();
    console.log('Successfully connected to target database!');

    // Try a simple query
    const count = await targetClient.category.count();
    console.log(`Found ${count} categories in target database`);
  } catch (error) {
    console.error('Error connecting to target database:', error);
  } finally {
    await targetClient.$disconnect();
  }
}

testConnection().catch(console.error);
