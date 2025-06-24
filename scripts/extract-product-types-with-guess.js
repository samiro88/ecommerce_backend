const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db";
const COLLECTION_NAME = "products";

// Improved helper to guess type from product name
function guessType(name = "") {
  const n = name.toLowerCase();

  // Accessories and machines first
  if (n.includes("machine") || n.includes("press") || n.includes("rack") || n.includes("banc") || n.includes("halter") || n.includes("barbell") || n.includes("curl") || n.includes("row") || n.includes("leg") || n.includes("pec")) return "Machine";
  if (n.includes("ceinture") || n.includes("belt")) return "Accessory";
  if (n.includes("shaker") || n.includes("bouteille") || n.includes("bottle")) return "Accessory";
  if (n.includes("pack")) return "Pack";
  if (n.includes("accessoire") || n.includes("accessory")) return "Accessory";

  // Supplements
  if (n.includes("caps") || n.includes("capsule") || n.includes("gélule")) return "Capsule";
  if (n.includes("tab")) return "Tablet";
  if (n.includes("pill")) return "Pill";
  if (n.includes("powder") || n.includes("poudre")) return "Powder";
  if (n.match(/\b\d+\s?g\b/)) return "Powder"; // e.g. "500 G", "400G"
  if (n.match(/\b\d+(\.|,)?\d*\s?kg\b/)) return "Powder"; // e.g. "2KG", "2,25 KG"
  if (n.includes("mass") || n.includes("gainer")) return "Gainer";
  if (n.includes("whey") || n.includes("isolate") || n.includes("protein")) return "Protein";
  if (n.includes("vegan")) return "Vegan Protein";

  // If nothing matches, leave blank
  return "";
}

async function main() {
  const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const products = db.collection(COLLECTION_NAME);

    const cursor = products.find({}, { projection: { _id: 1, designation_fr: 1 } });
    const results = await cursor.toArray();

    const tableData = results.map((prod) => ({
      _id: prod._id.toString(),
      name: prod.designation_fr,
      guessed_type: guessType(prod.designation_fr),
    }));

    // Print as a table for easy inspection
    console.table(tableData);

    // Prepare plain text output
    const header = "_id\tname\tguessed_type";
    const lines = tableData.map(row => `${row._id}\t${row.name || ""}\t${row.guessed_type || ""}`);
    const output = [header, ...lines].join("\n");

    // Write to file
    const outPath = path.join(__dirname, "product-types-with-better-guess.txt");
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`\nSaved output to ${outPath}`);

    console.log(`\nTotal products found: ${results.length}`);
    console.log("Review the 'guessed_type' column to identify capsules, pills, machines, etc.");
  } catch (err) {
    console.error("Error extracting product types:", err);
  } finally {
    await client.close();
  }
}

main();