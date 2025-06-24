const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Use your config
const uri = 'mongodb://localhost:27017';
const dbName = 'protein_db';

async function extractProductIds() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const products = await db.collection('products').find({}, { projection: { id: 1, _id: 0 } }).toArray();
    const productIds = products.map(p => p.id).filter(Boolean);

    // Write to product_ids.txt, one id per line
    const filePath = path.join(__dirname, 'product_ids.txt');
    fs.writeFileSync(filePath, productIds.join('\n'), 'utf8');
    console.log(`Extracted ${productIds.length} product ids to ${filePath}`);
  } catch (err) {
    console.error('Error extracting product ids:', err);
  } finally {
    await client.close();
  }
}

extractProductIds();