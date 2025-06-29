const { MongoClient } = require("mongodb");
const fs = require("fs");

const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db";
const DASHBOARD_COLLECTION = "dashboard_analytics";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const dashboardCol = db.collection(DASHBOARD_COLLECTION);

  // Find all documents in dashboard_analytics
  const docs = await dashboardCol.find({}).toArray();

  const report = docs.map(doc => ({
    _id: doc._id ? doc._id.toString() : null,
    ventesCount: Array.isArray(doc.ventes) ? doc.ventes.length : 0,
    sampleVente: (Array.isArray(doc.ventes) && doc.ventes.length > 0)
      ? {
          _id: doc.ventes[0]._id,
          items: doc.ventes[0].items
        }
      : null
  }));

  fs.writeFileSync(
    "dashboard_analytics_inspect.json",
    JSON.stringify(report, null, 2),
    "utf-8"
  );
  console.log("Inspection report written to dashboard_analytics_inspect.json");

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});