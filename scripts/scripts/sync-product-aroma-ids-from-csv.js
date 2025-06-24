const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { MongoClient, ObjectId } = require("mongodb");

// ====== CONFIGURATION ======
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db";
const PRODUCTS_COLLECTION = "products";
const CSV_PATH = "c:/Users/LENOVO/Downloads/product_flavors_assignment.csv";
const REPORT_PATH = path.join(__dirname, "results.txt");
const FLAVOR_FIELD = "aroma_ids"; // The field to update in MongoDB

// Helper: Extract flavor IDs from a CSV row
function extractFlavorIds(row) {
  const ids = [];
  for (let i = 1; i <= 5; i++) {
    const key = `flavor_${i}_id`;
    if (row[key] && row[key].trim()) {
      ids.push(row[key].trim());
    }
  }
  return ids;
}

// Helper: Try to convert a string to ObjectId if possible
function toMongoId(id) {
  if (typeof id === "string" && /^[a-f\d]{24}$/i.test(id)) {
    try {
      return new ObjectId(id);
    } catch (e) {
      // fallback to string if invalid
      return id;
    }
  }
  return id;
}

async function main() {
  // Step 1: Read CSV and build mapping
  const productFlavorMap = {}; // _id (string) => [flavor_id, ...]
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => {
        const productId = row["_id"] ? row["_id"].trim() : null;
        if (!productId) return;
        const flavorIds = extractFlavorIds(row);
        productFlavorMap[productId] = flavorIds;
      })
      .on("end", resolve)
      .on("error", reject);
  });

  // Step 2: Connect to MongoDB and update products
  const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  const reportLines = [];
  let updated = 0, cleared = 0, notFound = 0, unchanged = 0;

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const products = db.collection(PRODUCTS_COLLECTION);

    for (const [productId, flavorIds] of Object.entries(productFlavorMap)) {
      // Convert to ObjectId if possible
      const filter = { _id: toMongoId(productId) };
      const product = await products.findOne(filter);

      if (!product) {
        reportLines.push(`NOT FOUND: Product ${productId} not found in DB.`);
        notFound++;
        continue;
      }

      const currentAromaIds = Array.isArray(product[FLAVOR_FIELD])
        ? product[FLAVOR_FIELD].map(String)
        : [];

      // Compare as arrays of strings
      const newAromaIds = flavorIds.map(String);

      // Only update if different
      const isDifferent =
        currentAromaIds.length !== newAromaIds.length ||
        currentAromaIds.some((id, idx) => id !== newAromaIds[idx]);

      if (isDifferent) {
        if (newAromaIds.length > 0) {
          await products.updateOne(filter, { $set: { [FLAVOR_FIELD]: newAromaIds } });
          reportLines.push(
            `UPDATED: ${productId} | ${product.designation_fr || ""} | aroma_ids: ${JSON.stringify(currentAromaIds)} -> ${JSON.stringify(newAromaIds)}`
          );
          updated++;
        } else {
          // Remove the field or set to empty array (choose one)
          await products.updateOne(filter, { $unset: { [FLAVOR_FIELD]: "" } });
          reportLines.push(
            `CLEARED: ${productId} | ${product.designation_fr || ""} | aroma_ids: ${JSON.stringify(currentAromaIds)} -> []`
          );
          cleared++;
        }
      } else {
        reportLines.push(
          `UNCHANGED: ${productId} | ${product.designation_fr || ""} | aroma_ids: ${JSON.stringify(currentAromaIds)}`
        );
        unchanged++;
      }
    }

    // Write report
    const summary = [
      `Total products in CSV: ${Object.keys(productFlavorMap).length}`,
      `Updated: ${updated}`,
      `Cleared: ${cleared}`,
      `Unchanged: ${unchanged}`,
      `Not found: ${notFound}`,
      "",
      ...reportLines,
    ].join("\n");
    fs.writeFileSync(REPORT_PATH, summary, "utf8");
    console.log(`Sync complete! See report at ${REPORT_PATH}`);
  } catch (err) {
    console.error("Error syncing product flavors:", err);
  } finally {
    await client.close();
  }
}

main();