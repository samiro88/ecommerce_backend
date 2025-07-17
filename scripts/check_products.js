// check_combinations.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('protein_db');
    const products = db.collection('products');

    // Get all unique sous_categorie_id and brand_id values
    const sousCats = await products.distinct('sous_categorie_id');
    const brands = await products.distinct('brand_id');

    console.log('Unique sous_categorie_id:', sousCats);
    console.log('Unique brand_id:', brands);

    let found = 0;
    for (const sousCat of sousCats) {
      for (const brand of brands) {
        const count = await products.countDocuments({
          sous_categorie_id: sousCat,
          brand_id: brand
        });
        if (count > 0) {
          found++;
          console.log(`Found ${count} product(s) with sous_categorie_id=${sousCat} and brand_id=${brand}`);
        }
      }
    }
    if (found === 0) {
      console.log('No matching (sous_categorie_id, brand_id) combinations found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();