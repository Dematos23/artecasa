
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

import { admin, db } from '../src/lib/firebase-admin';
import type { CollectionReference, DocumentData } from 'firebase-admin/firestore';

// =================================================================================
// CONFIGURATION
// =================================================================================

// The ID of the tenant where the existing data will be moved.
const DEFAULT_TENANT_ID = 'artecasa-test';

// If true, the script will only log what it would do, without writing to Firestore.
const DRY_RUN = true;

// If true, the script will stop if it encounters an error moving a document.
const STOP_ON_ERROR = true;

// =================================================================================

async function migrateCollection(
  sourceCollectionName: string,
  destinationCollection: CollectionReference
) {
  console.log(`\n--- Starting migration for collection: "${sourceCollectionName}" ---`);

  const sourceCollectionRef = db.collection(sourceCollectionName);
  const snapshot = await sourceCollectionRef.get();

  if (snapshot.empty) {
    console.log(`No documents found in "${sourceCollectionName}". Skipping.`);
    return { moved: 0, failed: 0 };
  }

  console.log(`Found ${snapshot.docs.length} documents to migrate.`);

  let movedCount = 0;
  let failedCount = 0;

  for (const doc of snapshot.docs) {
    try {
      const sourceData = doc.data();
      const destinationDocRef = destinationCollection.doc(doc.id);

      if (!DRY_RUN) {
        const batch = db.batch();
        batch.set(destinationDocRef, sourceData); // Copy to new location
        batch.delete(doc.ref); // Delete from old location
        await batch.commit();
      }
      
      console.log(`  [OK] Migrated ${sourceCollectionName}/${doc.id} -> tenants/${DEFAULT_TENANT_ID}/${destinationCollection.id}/${doc.id}`);
      movedCount++;

    } catch (error) {
      console.error(`  [ERROR] Failed to migrate ${sourceCollectionName}/${doc.id}:`, error);
      failedCount++;
      if (STOP_ON_ERROR) {
        throw new Error(`Migration stopped due to an error on doc ${doc.id}.`);
      }
    }
  }

  console.log(`--- Finished migration for "${sourceCollectionName}" ---`);
  console.log(`  Successfully moved: ${movedCount}`);
  console.log(`  Failed: ${failedCount}`);

  return { moved: movedCount, failed: failedCount };
}

async function main() {
  console.log('=================================================================');
  console.log('            FIRESTORE DATA MIGRATION SCRIPT (SINGLE-TENANT)      ');
  console.log('=================================================================');
  console.log(`Target Tenant ID: ${DEFAULT_TENANT_ID}`);
  console.log(`Dry Run Mode: ${DRY_RUN ? 'ENABLED (no changes will be made)' : 'DISABLED (changes WILL be made)'}`);
  
  if (DRY_RUN) {
      console.warn('\nWARNING: DRY_RUN is enabled. To apply changes, set DRY_RUN to false in the script.\n');
  } else {
      console.warn('\nWARNING: DRY_RUN is disabled. This script WILL modify your database.\n');
  }

  try {
    const propertiesDest = db.collection(`tenants/${DEFAULT_TENANT_ID}/properties`);
    const contactsDest = db.collection(`tenants/${DEFAULT_TENANT_ID}/contacts`);
    const leadsDest = db.collection(`tenants/${DEFAULT_TENANT_ID}/leads`);

    await migrateCollection('properties', propertiesDest);
    await migrateCollection('contacts', contactsDest);
    await migrateCollection('leads', leadsDest);

    console.log('\n\nMigration script finished successfully.');

  } catch (error) {
    console.error('\n\nMigration script failed:', error);
    process.exit(1);
  } finally {
    // Gracefully close the Firestore connection
    await admin.app().delete();
  }
}

main();
