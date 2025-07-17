// Script to extract products in stock and on promotion (bruteforce version)
// Usage: node extract-top-promotions.js
// This script is READ-ONLY and will NOT modify the database.

const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

function parseNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = Number(val.replace(/[^\d.\-]/g, ''));
    return isNaN(n) ? null : n;
  }
  return null;
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);

    const products = await Product.find({}).lean();
    console.log(`\n=== DEBUG OUTPUT START ===`);
    console.log(`Total products found in collection: ${products.length}`);
    if (products.length === 0) {
      console.log('No products found in the collection.');
      console.log('=== DEBUG OUTPUT END ===');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Print first 3 products raw
    console.log('\nFirst 3 products (raw):');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`Product ${i + 1}:`, p);
    });

    // 1. Products with non-null promo and prix
    console.log('\nSample: Products with non-null promo and prix:');
    const promoPrix = products.filter(p => p.promo != null && p.prix != null).slice(0, 5);
    if (promoPrix.length === 0) console.log('  None found.');
    promoPrix.forEach(p => {
      console.log({ _id: p._id, designation_fr: p.designation_fr, prix: p.prix, promo: p.promo, qte: p.qte, rupture: p.rupture, publier: p.publier });
    });

    // 2. Products with qte > 0 and rupture == "0"
    console.log('\nSample: Products with qte > 0 and rupture == "0":');
    const inStock = products.filter(p => parseNumber(p.qte) > 0 && (p.rupture === '0' || p.rupture === 0 || p.rupture === false)).slice(0, 5);
    if (inStock.length === 0) console.log('  None found.');
    inStock.forEach(p => {
      console.log({ _id: p._id, designation_fr: p.designation_fr, prix: p.prix, promo: p.promo, qte: p.qte, rupture: p.rupture, publier: p.publier });
    });

    // 3. Products with publier == "1"
    console.log('\nSample: Products with publier == "1":');
    const published = products.filter(p => p.publier === '1' || p.publier === 1).slice(0, 5);
    if (published.length === 0) console.log('  None found.');
    published.forEach(p => {
      console.log({ _id: p._id, designation_fr: p.designation_fr, prix: p.prix, promo: p.promo, qte: p.qte, rupture: p.rupture, publier: p.publier });
    });

    // Keep the original extraction logic for reference
    const filtered = products.filter(p => {
      const prix = parseNumber(p.prix);
      const promo = parseNumber(p.promo);
      const qte = parseNumber(p.qte);
      const inStock = qte > 0 && (p.rupture === '0' || p.rupture === 0 || p.rupture === false);
      const hasPromo = promo !== null && prix !== null && promo < prix;
      const isActive = p.publier === '1' || p.publier === 1;
      return inStock && hasPromo && isActive;
    });
    const output = filtered.map(p => ({
      _id: p._id,
      designation_fr: p.designation_fr,
      prix: p.prix,
      promo: p.promo,
      qte: p.qte,
      rupture: p.rupture,
      publier: p.publier
    }));
    fs.writeFileSync('top-promotions-output.json', JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\nSuccess: Found ${output.length} top promotion products. Output written to top-promotions-output.json.`);
    console.log('=== DEBUG OUTPUT END ===');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();