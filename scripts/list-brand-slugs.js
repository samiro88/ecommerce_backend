const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  slug: String,
}, { collection: 'brands' });

const Brand = mongoose.model('Brand', BrandSchema);

async function main() {
  await mongoose.connect('mongodb://localhost:27017/protein_db');

  const brands = await Brand.find({}, { slug: 1, _id: 0 });
  brands.forEach(b => console.log(b.slug));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});