#!/usr/bin/env tsx

/**
 * Comprehensive Clerk to Better Auth Migration Script
 * Migrates users from Clerk export CSV to Better Auth with full feature support
 */

import { generateRandomString, symmetricEncrypt } from "better-auth/crypto";
import { auth } from "@repo/auth/server";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ClerkUserCSV {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  primary_email_address: string;
  primary_phone_number: string;
  verified_email_addresses: string;
  unverified_email_addresses: string;
  verified_phone_numbers: string;
  unverified_phone_numbers: string;
  totp_secret: string;
  password_digest: string;
  password_hasher: string;
}

interface ClerkUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  image_url: string;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number;
  created_at: number;
  updated_at: number;
  external_accounts: {
    id: string;
    provider: string;
    identification_id: string;
    provider_user_id: string;
    approved_scopes: string;
    email_address: string;
    first_name: string;
    last_name: string;
    image_url: string;
    created_at: number;
    updated_at: number;
  }[];
}

function getCSVData(csv: string): ClerkUserCSV[] {
  const lines = csv.split('\n').filter(line => line.trim());
  const headers = lines[0]?.split(',').map(header => header.trim()) || [];
  const jsonData = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {} as Record<string, string>);
  });

  return jsonData as ClerkUserCSV[];
}

async function getClerkUsers(totalUsers: number): Promise<ClerkUser[]> {
  const clerkUsers: ClerkUser[] = [];
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  if (!CLERK_SECRET_KEY) {
    console.log('⚠️  CLERK_SECRET_KEY not found, will proceed with CSV data only');
    return [];
  }

  for (let i = 0; i < totalUsers; i += 500) {
    try {
      const response = await fetch(`https://api.clerk.com/v1/users?offset=${i}&limit=500`, {
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`
        }
      });
      
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch Clerk users batch ${i}: ${response.statusText}`);
        continue;
      }
      
      const clerkUsersData = await response.json();
      clerkUsers.push(...clerkUsersData);
    } catch (error) {
      console.warn(`⚠️  Error fetching Clerk users batch ${i}:`, error);
    }
  }
  return clerkUsers;
}

export async function generateBackupCodes(secret: string): Promise<string> {
  const backupCodes = Array.from({ length: 10 })
    .fill(null)
    .map(() => generateRandomString(10, "a-z", "0-9", "A-Z"))
    .map((code) => `${code.slice(0, 5)}-${code.slice(5)}`);
    
  const encCodes = await symmetricEncrypt({
    data: JSON.stringify(backupCodes),
    key: secret,
  });
  return encCodes;
}

// Helper function to safely convert timestamp to Date
function safeDateConversion(timestamp?: number): Date {
  if (!timestamp) return new Date();

  // Convert seconds to milliseconds if needed
  const date = new Date(timestamp > 1e10 ? timestamp : timestamp * 1000);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid timestamp: ${timestamp}, falling back to current date`);
    return new Date();
  }

  // Check for unreasonable dates (before 2000 or after 2100)
  const year = date.getFullYear();
  if (year < 2000 || year > 2100) {
    console.warn(`Suspicious date year: ${year}, falling back to current date`);
    return new Date();
  }

  return date;
}

async function migrateFromClerk() {
  console.log('🚀 Starting Clerk to Better Auth migration...');

  // Check if CSV file exists
  const csvPath = path.join(process.cwd(), 'exported_users.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ exported_users.csv not found. Please export users from Clerk first.');
    process.exit(1);
  }

  const exportedUserCSV = await fs.promises.readFile(csvPath, 'utf-8');
  const jsonData = getCSVData(exportedUserCSV);
  
  console.log(`📊 Found ${jsonData.length} users in CSV export`);

  if (jsonData.length === 0) {
    console.log('✅ No users to migrate');
    return;
  }

  // Fetch additional data from Clerk API if available
  const clerkUsers = await getClerkUsers(jsonData.length);
  console.log(`📊 Fetched ${clerkUsers.length} users from Clerk API`);

  // Get Better Auth context and check enabled plugins
  const ctx = await auth.$context;
  const isAdminEnabled = ctx.options?.plugins?.find(plugin => plugin.id === "admin");
  const isTwoFactorEnabled = ctx.options?.plugins?.find(plugin => plugin.id === "two-factor");
  const isUsernameEnabled = ctx.options?.plugins?.find(plugin => plugin.id === "username");
  const isPhoneNumberEnabled = ctx.options?.plugins?.find(plugin => plugin.id === "phone-number");

  console.log(`🔧 Plugin status: Admin=${!!isAdminEnabled}, TwoFactor=${!!isTwoFactorEnabled}, Username=${!!isUsernameEnabled}, PhoneNumber=${!!isPhoneNumberEnabled}`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of jsonData) {
    try {
      const { 
        id, 
        first_name, 
        last_name, 
        username, 
        primary_email_address, 
        primary_phone_number, 
        verified_email_addresses, 
        unverified_email_addresses, 
        verified_phone_numbers, 
        unverified_phone_numbers, 
        totp_secret, 
        password_digest, 
        password_hasher 
      } = user;

      const clerkUser = clerkUsers.find(clerkUser => clerkUser?.id === id);

      console.log(`👤 Migrating user: ${primary_email_address} (${id})`);

      // Create user with all Better Auth features
      const createdUser = await ctx.adapter.create({
        model: "user",
        data: {
          id,
          email: primary_email_address,
          emailVerified: verified_email_addresses.length > 0,
          name: `${first_name} ${last_name}`.trim(),
          firstName: first_name || null,
          lastName: last_name || null,
          image: clerkUser?.image_url || null,
          role: 'CUSTOMER', // Default role
          createdAt: safeDateConversion(clerkUser?.created_at),
          updatedAt: safeDateConversion(clerkUser?.updated_at),
          
          // Two Factor (if enabled)
          ...(isTwoFactorEnabled ? {
            twoFactorEnabled: clerkUser?.two_factor_enabled || false
          } : {}),
          
          // Admin (if enabled)
          ...(isAdminEnabled ? {
            banned: clerkUser?.banned || false,
            banExpiresAt: clerkUser?.lockout_expires_in_seconds 
              ? new Date(Date.now() + clerkUser.lockout_expires_in_seconds * 1000) 
              : null,
          } : {}),
          
          // Username (if enabled)
          ...(isUsernameEnabled ? {
            username: username || null,
          } : {}),
          
          // Phone Number (if enabled)
          ...(isPhoneNumberEnabled ? {
            phoneNumber: primary_phone_number || null,
            phoneNumberVerified: verified_phone_numbers.length > 0,
          } : {}),
        },
        forceAllowId: true
      }).catch(async (e) => {
        // If user already exists, fetch it
        console.log(`ℹ️  User ${primary_email_address} already exists, fetching existing record`);
        return await ctx.adapter.findOne({
          model: "user",
          where: [{
            field: "id",
            value: id
          }]
        });
      });

      if (!createdUser) {
        throw new Error(`Failed to create or find user ${primary_email_address}`);
      }

      // Create external accounts
      const externalAccounts = clerkUser?.external_accounts || [];
      
      // Always create a credential account for email/password auth
      if (password_digest && password_hasher) {
        await ctx.adapter.create({
          model: "account",
          data: {
            userId: createdUser.id,
            type: "email",
            providerId: "credential",
            accountId: primary_email_address,
            password: password_digest,
            createdAt: safeDateConversion(clerkUser?.created_at),
            updatedAt: safeDateConversion(clerkUser?.updated_at),
          }
        }).catch(() => {
          console.log(`ℹ️  Credential account for ${primary_email_address} already exists`);
        });
      }

      // Create other external accounts (OAuth providers)
      for (const externalAccount of externalAccounts) {
        const { id: accountId, provider, provider_user_id, approved_scopes, created_at, updated_at } = externalAccount;
        
        if (provider === "credential") continue; // Skip, we handled this above
        
        const providerId = provider.replace("oauth_", ""); // Remove oauth_ prefix
        
        await ctx.adapter.create({
          model: "account",
          data: {
            id: accountId,
            userId: createdUser.id,
            type: "oauth",
            providerId: providerId,
            accountId: provider_user_id,
            scope: approved_scopes,
            createdAt: safeDateConversion(created_at),
            updatedAt: safeDateConversion(updated_at),
          },
          forceAllowId: true
        }).catch(() => {
          console.log(`ℹ️  ${providerId} account for ${primary_email_address} already exists`);
        });
      }

      // Create two-factor setup if enabled and user has TOTP secret
      if (isTwoFactorEnabled && totp_secret) {
        await ctx.adapter.create({
          model: "twoFactor",
          data: {
            userId: createdUser.id,
            secret: totp_secret,
            backupCodes: await generateBackupCodes(totp_secret)
          }
        }).catch(() => {
          console.log(`ℹ️  Two-factor setup for ${primary_email_address} already exists`);
        });
      }

      console.log(`✅ Successfully migrated: ${primary_email_address}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed to migrate user ${user.primary_email_address}:`, error);
      errorCount++;
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} users`);
  console.log(`❌ Failed migrations: ${errorCount} users`);
  console.log(`📊 Total processed: ${jsonData.length} users`);

  if (successCount > 0) {
    console.log('\n🔐 Important Post-Migration Notes:');
    console.log('• Users with passwords can sign in immediately');
    console.log('• Users without passwords should use "Forgot Password" flow');
    console.log('• Two-factor authentication settings have been preserved');
    console.log('• OAuth connections have been migrated');
    console.log('• User roles and admin settings have been applied');
  }
}

async function main() {
  try {
    await migrateFromClerk();
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}