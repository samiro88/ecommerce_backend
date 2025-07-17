// Script to convert date fields from string to Date in top_promotions collection
// Usage: node fix-top-promotions-dates.js

const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);

    const collection = mongoose.connection.collection('top_promotions');
    const docs = await collection.find({}).toArray();

    let updatedCount = 0;
    for (const doc of docs) {
      // Only update if any of the fields are strings
      const needsUpdate =
        typeof doc.startDate === 'string' ||
        typeof doc.endDate === 'string' ||
        typeof doc.createdAt === 'string' ||
        typeof doc.updatedAt === 'string';

      if (needsUpdate) {
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              startDate: doc.startDate ? new Date(doc.startDate) : null,
              endDate: doc.endDate ? new Date(doc.endDate) : null,
              createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
              updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
            },
          }
        );
        updatedCount++;
      }
    }

    console.log(`Success: Updated ${updatedCount} documents in top_promotions with Date objects.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();