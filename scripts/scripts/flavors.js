const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db";
const AROMAS_COLLECTION = "aromas"; // Change if your collection name is different

async function main() {
  const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const aromas = db.collection(AROMAS_COLLECTION);

    // Fetch all aromas, project only _id and designation_fr (French name)
    const aromaDocs = await aromas.find({}, { projection: { _id: 1, id: 1, designation_fr: 1 } }).toArray();

    // Prepare output
    const tableData = aromaDocs.map(aroma => ({
      _id: aroma._id.toString(),
      id: aroma.id || "",
      name: aroma.designation_fr || ""
    }));

    // Print as a table for easy inspection
    console.table(tableData);

    // Prepare plain text output
    const header = "_id\tid\tname";
    const lines = tableData.map(row =>
      `${row._id}\t${row.id}\t${row.name}`
    );
    const output = [header, ...lines].join("\n");

    // Write to file
    const outPath = path.join(__dirname, "flavors-table.txt");
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`\nSaved output to ${outPath}`);

    console.log(`\nTotal flavors found: ${aromaDocs.length}`);
  } catch (err) {
    console.error("Error extracting flavors:", err);
  } finally {
    await client.close();
  }
}

main();