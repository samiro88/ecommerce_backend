require('dotenv').config({ path: '../../.env' });
// filepath: c:\Users\LENOVO\Desktop\ecommerce\ecommerce-backend\scripts\scripts\fix-top-promotions.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'protein_db';
const collectionName = 'top_promotions';

async function fixTopPromotions() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  let successCount = 0;
  let failCount = 0;

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const cursor = collection.find({ "productId._id": { $exists: true } });

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const productObjectId = doc.productId._id;
      console.log(`Checking document _id: ${doc._id}, productId:`, doc.productId);
      try {
        const result = await collection.updateOne(
          { _id: doc._id },
          { $set: { productId: productObjectId } }
        );
        if (result.modifiedCount === 1) {
          console.log(`✅ Updated document _id: ${doc._id}`);
          successCount++;
        } else {
          console.log(`⚠️ No change for document _id: ${doc._id}`);
          failCount++;
        }
      } catch (err) {
        console.error(`❌ Failed to update _id: ${doc._id}`, err);
        failCount++;
      }
    }

    console.log(`\nFinished. Success: ${successCount}, Fail: ${failCount}`);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.close();
  }
}

fixTopPromotions();