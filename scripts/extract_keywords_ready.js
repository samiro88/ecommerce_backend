// Script to extract keyword relationships from MongoDB (read-only)
// Usage: node extract_keywords_ready.js
// Outputs: keywords_ready.json

const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'protein_db';
const OUTPUT_FILE = 'keywords_ready.json';

const KEYWORDS = [
  'WHEY PROTEIN',
  'CREATINE',
  'AMINO',
  'ZMA',
  'REALPHARM',
  'GAINER',
  'WHEY ISOLATE',
  'BCAA',
  'GLUTAMINE',
  'VITAMINE',
  'ACIDES AMINES',
  'MASS GAINER',
  'WHEY PROTEINE'
];

function matchKeyword(keyword, ...fields) {
  const kw = keyword.toLowerCase();
  return fields.some(f => typeof f === 'string' && f.toLowerCase().includes(kw));
}

async function extract() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const products = await db.collection('products').find({}).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    const subcategories = await db.collection('subcategories').find({}).toArray();
    console.log(`[DEBUG] Loaded ${products.length} products, ${categories.length} categories, ${subcategories.length} subcategories`);

    const result = [];
    for (const keyword of KEYWORDS) {
      const product_ids = products
        .filter(p => matchKeyword(keyword, p.designation_fr, p.description_fr, p.meta_description_fr, p.meta, p.name))
        .map(p => p._id?.toString() || p.id?.toString()).filter(Boolean);
      const category_ids = categories
        .filter(c => matchKeyword(keyword, c.designation_fr, c.description_fr, c.meta_description_fr, c.meta, c.name))
        .map(c => c._id?.toString() || c.id?.toString()).filter(Boolean);
      const subcategory_ids = subcategories
        .filter(s => matchKeyword(keyword, s.designation_fr, s.description_fr, s.meta_description_fr, s.meta, s.name))
        .map(s => s._id?.toString() || s.id?.toString()).filter(Boolean);
      result.push({
        keyword,
        product_ids,
        category_ids,
        subcategory_ids
      });
      console.log(`[DEBUG] Keyword "${keyword}": ${product_ids.length} products, ${category_ids.length} categories, ${subcategory_ids.length} subcategories`);
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
    console.log(`[SUCCESS] Output written to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('[FAIL] Error:', err);
  } finally {
    await client.close();
  }
}

extract();
