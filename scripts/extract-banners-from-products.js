/**
 * This script extracts the 3 specific products matching the given keywords,
 * retrieves their full documents (all fields), and writes them to a JSON file
 * suitable for direct MongoDB import (e.g., with mongoimport).
 * No fields are changed or omitted.
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db"; // Change if your DB name is different

const KEYWORDS = [
  { keyword: "Hydro Whey" },
  { keyword: "LIPO 6" },
  { keyword: "tapis" }, // French for treadmill
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const products = db.collection("products");

  const foundProducts = [];

  for (const { keyword } of KEYWORDS) {
    // Find the first matching product for each keyword
    const product = await products.findOne({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { designation_fr: { $regex: keyword, $options: "i" } },
        { description_fr: { $regex: keyword, $options: "i" } },
      ],
    });

    if (product) {
      foundProducts.push(product);
    } else {
      console.warn(`No product found for keyword: ${keyword}`);
    }
  }

  // Write the array of full product documents to a JSON file
  fs.writeFileSync(
    "products-for-mongo-import.json",
    JSON.stringify(foundProducts, null, 2),
    "utf-8"
  );
  console.log("Extracted products:", foundProducts);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});