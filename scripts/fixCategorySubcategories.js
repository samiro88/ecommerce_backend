// checkCategorySubcategories.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'protein_db';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const categories = db.collection('categories');

    const allCats = await categories.find().toArray();

    if (allCats.length === 0) {
      console.log('No categories found.');
      return;
    }

    allCats.forEach(cat => {
      const subCats = cat.subCategories || [];
      console.log(`Category: ${cat.designation_fr || cat.designation || cat.name || cat.id} (id: ${cat.id}, _id: ${cat._id})`);
      console.log(`  subCategories: [${subCats.length}]`);
      if (subCats.length > 0) {
        console.log('    ObjectIds:', subCats.map(x => x.toString()).join(', '));
      }
      console.log('---');
    });
    console.log(`Checked ${allCats.length} categories.`);
  } catch (err) {
    console.error('Error reading categories:', err);
  } finally {
    await client.close();
  }
}

main();