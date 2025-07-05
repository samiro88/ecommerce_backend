const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';

async function test() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db('protein_db');
    const docs = await db.collection('VenteFlash').find({}).toArray();
    console.log('VenteFlash docs:', docs);
  } catch (err) {
    console.error('MongoDB error:', err);
  } finally {
    await client.close();
  }
}

test();