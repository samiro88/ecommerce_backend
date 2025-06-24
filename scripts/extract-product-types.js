/**
 * Script to extract all products' _id, designation_fr (name), and type from MongoDB.
 * Usage: node extract-product-types.js
 * Make sure to install mongodb: npm install mongodb
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Use your .env config values here:
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db";
const COLLECTION_NAME = "products"; // Change if your collection name is different

async function main() {
  const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const products = db.collection(COLLECTION_NAME);

    // Project only the fields we care about
    const cursor = products.find({}, { projection: { _id: 1, designation_fr: 1, type: 1 } });

    const results = await cursor.toArray();

    // Prepare data for table and file
    const tableData = results.map((prod) => ({
      _id: prod._id.toString(),
      name: prod.designation_fr,
      type: prod.type,
    }));

    // Print as a table for easy inspection
    console.table(tableData);

    // Prepare plain text output
    const header = "_id\tname\ttype";
    const lines = tableData.map(row => `${row._id}\t${row.name || ""}\t${row.type || ""}`);
    const output = [header, ...lines].join("\n");

    // Write to file
    const outPath = path.join(__dirname, "product-types-output.txt");
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`\nSaved output to ${outPath}`);

    console.log(`\nTotal products found: ${results.length}`);
    console.log("Review the 'type' column to identify capsules, pills, etc.");
  } catch (err) {
    console.error("Error extracting product types:", err);
  } finally {
    await client.close();
  }
}

main();