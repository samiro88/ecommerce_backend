const { MongoClient, ObjectId } = require('mongodb');

// Use your provided connection string
const uri = 'mongodb+srv://bitoutawalid:ee6w2lnn4i14DCd9@cluster0.lz5skuo.mongodb.net/protein_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('protein_db');
    const categories = db.collection('categories');

    // Helper to update and log result
    async function updateAndLog(_id, value) {
      const result = await categories.updateOne(
        { _id: new ObjectId(_id) },
        { $set: { schema_description: value } }
      );
      if (result.modifiedCount === 1) {
        console.log(`Success: Updated schema_description for _id ${_id}`);
      } else if (result.matchedCount === 1) {
        console.log(`No change needed: schema_description already set for _id ${_id}`);
      } else {
        console.log(`Failed: No document found with _id ${_id}`);
      }
    }

    await updateAndLog("6810a533cecd66abf472c0b3", null);
    await updateAndLog("6810a533cecd66abf472c0b4", null);
    await updateAndLog("6810a533cecd66abf472c0b5", "Optimisez votre prise de masse en Tunisie avec nos protéines dédiées à la prise de masse, offertes à des prix pas cher et compétitifs.");
    await updateAndLog("6810a533cecd66abf472c0b6", `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Protéines - Protein.tn",
  "description": "Protéines Tunisie sur Protein.tn : whey, isolat, caséine pas chers pour musculation et récupération rapide. Prix compétitifs et livraison rapide en Tunisie.",
  "brand": {
    "@type": "Brand",
    "name": "Protein.tn"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "TND",
    "price": "prix compétitif",
    "availability": "https://schema.org/InStock",
    "url": "https://protein.tn/proteines"
  },
  "category": "Compléments Alimentaires",
  "keywords": "protéines Tunisie, whey protéine, isolat, caséine, Protein.tn, musculation"
}`);
    await updateAndLog("6810a533cecd66abf472c0b7", null);
    await updateAndLog("6810a533cecd66abf472c0b8", `{
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "name": "Équipements et Accessoires Sportifs",
  "description": "Découvrez la meilleure sélection d’équipements et accessoires sportifs sur Protein.tn : haltères, kettlebells, tapis, gants, bandes de résistance et sacs de sport. Idéal pour musculation, yoga, crossfit et entraînements à domicile. Livraison rapide partout en Tunisie.",
  "brand": {
    "@type": "Organization",
    "name": "Protein.tn"
  },
  "url": "https://www.protein.tn/equipements-accessoires-sportifs",
  "image": "https://www.protein.tn/assets/images/equipements-cover.jpg",
  "category": "Accessoires de sport, Fitness, Musculation",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "15",
    "highPrice": "1200",
    "priceCurrency": "TND",
    "offerCount": "36"
  }
}`);

    console.log('All updates attempted.');
  } catch (err) {
    console.error('Error updating documents:', err);
  } finally {
    await client.close();
  }
}

run();