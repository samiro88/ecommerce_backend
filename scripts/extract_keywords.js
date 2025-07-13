// Script to extract all unique keywords/tags from MongoDB collections
// Does not modify the database. Outputs to keywords.json
// Usage: node extract_keywords.js

const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'protein_db';
const OUTPUT_FILE = 'keywords.json';

// List of possible keyword fields to check
const KEYWORD_FIELDS = ['keywords', 'tags', 'mots_cles', 'motsCles', 'motscles', 'meta.keywords', 'meta.tags', 'features'];

async function extractKeywords() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  let allKeywords = new Set();
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log(`[DEBUG] Found collections: ${collections.map(c => c.name).join(', ')}`);
    for (const col of collections) {
      const collection = db.collection(col.name);
      const docs = await collection.find({}).limit(10000).toArray();
      for (const doc of docs) {
        for (const field of KEYWORD_FIELDS) {
          let value = field.split('.').reduce((o, k) => (o ? o[k] : undefined), doc);
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (typeof v === 'string' && v.trim()) allKeywords.add(v.trim());
            });
          } else if (typeof value === 'string' && value.trim()) {
            // If comma or semicolon separated
            value.split(/[;,]/).forEach(v => {
              if (v.trim()) allKeywords.add(v.trim());
            });
          }
        }
      }
    }
    const keywordsArr = Array.from(allKeywords).sort();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(keywordsArr, null, 2), 'utf8');
    console.log(`[SUCCESS] Extracted ${keywordsArr.length} unique keywords/tags. Output written to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('[FAIL] Error extracting keywords:', err);
  } finally {
    await client.close();
  }
}

extractKeywords();
