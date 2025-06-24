/**
 * Script to add the aroma_ids attribute to all products in the products collection.
 * Reads the list of aroma IDs from aroma_ids.json.
 * 
 * Usage: node scripts/add-aroma-ids-to-all-products.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/protein_db';
  const dbName = process.env.DB_NAME || 'protein_db';

  // Read aroma_ids from JSON file
  const aromaIdsPath = path.join(__dirname, 'aroma_ids.json');
  if (!fs.existsSync(aromaIdsPath)) {
    console.error('aroma_ids.json not found!');
    process.exit(1);
  }
  const aromaIds = JSON.parse(fs.readFileSync(aromaIdsPath, 'utf8'));

  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Update all products to have the aroma_ids attribute
    const updateResult = await db.collection('products').updateMany(
      {},
      { $set: { aroma_ids: aromaIds } }
    );

    console.log(`Updated ${updateResult.modifiedCount} products with aroma_ids attribute.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

main();