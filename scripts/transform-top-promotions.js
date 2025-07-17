// Script to transform top promotions data for future-proof schema (local only)
// Usage: node transform-top-promotions.js
// Reads from top-promotions-output.json and writes to top-promotions-final.json

const fs = require('fs');

function parseNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = Number(val.replace(/[^\d.\-]/g, ''));
    return isNaN(n) ? null : n;
  }
  return null;
}

function toObjectIdString(id) {
  // Just keep as string for JSON export; Mongo will convert on import
  return id;
}

function main() {
  try {
    const raw = fs.readFileSync('top-promotions-output.json', 'utf-8');
    const data = JSON.parse(raw);
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const docs = data.map(item => ({
      productId: toObjectIdString(item._id),
      designation_fr: item.designation_fr,
      prix: parseNumber(item.prix),
      promo: parseNumber(item.promo),
      qte: parseNumber(item.qte),
      rupture: item.rupture,
      publier: item.publier,
      startDate: now,
      endDate: oneMonthLater,
      createdAt: now,
      updatedAt: now,
      active: true
    }));

    fs.writeFileSync('top-promotions-final.json', JSON.stringify(docs, null, 2), 'utf-8');
    console.log(`Success: Transformed ${docs.length} documents. Output written to top-promotions-final.json.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();