// extract_dashboard_data.js

const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb://localhost:27017/protein_db';
const DB_NAME = 'protein_db';

async function main() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  const result = {};

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // ventes
    result.ventes = await db.collection('ventes').find({}, {
      projection: {
        _id: 1,
        createdAt: 1,
        status: 1,
        netAPayer: 1,
        totalAmount: 1,
        items: 1,
        promoCode: 1,
        discount: 1,
        "client.country": 1
      }
    }).toArray();

    // products
    result.products = await db.collection('products').find({}, {
      projection: {
        _id: 1,
        name: 1,
        category: 1,
        brand: 1,
        salesCount: 1,
        costPrice: 1
      }
    }).toArray();

    // categories
    result.categories = await db.collection('categories').find({}, {
      projection: {
        _id: 1,
        designation: 1
      }
    }).toArray();

    // promocodes
    result.promocodes = await db.collection('promocodes').find({}, {
      projection: {
        _id: 1,
        code: 1,
        discount: 1
      }
    }).toArray();

    // invoices
    result.invoices = await db.collection('invoices').find({}, {
      projection: {
        _id: 1,
        date: 1,
        total: 1,
        items: 1
      }
    }).toArray();

    // commandes
    result.commandes = await db.collection('commandes').find({}, {
      projection: {
        _id: 1,
        created_at: 1,
        prix_ttc: 1,
        nom: 1,
        email: 1
      }
    }).toArray();

    // users
    result.users = await db.collection('users').find({}, {
      projection: {
        _id: 1,
        created_at: 1,
        name: 1,
        email: 1
      }
    }).toArray();

    fs.writeFileSync('dashboard_data_extract.json', JSON.stringify(result, null, 2), 'utf-8');
    console.log('Dashboard data extracted to dashboard_data_extract.json');
  } catch (err) {
    console.error('Extraction error:', err);
  } finally {
    await client.close();
  }
}

main();