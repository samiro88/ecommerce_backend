import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";

// === CONFIGURATION ===
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/protein_db";
const DB_NAME = process.env.DB_NAME || "protein_db";
const COLLECTION_NAME = "brands"; // Your collection name

// Output file
const OUTPUT_PATH = path.resolve(__dirname, "brand-image-simple-mapping.txt");

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const brands = await db.collection(COLLECTION_NAME).find({}).toArray();

    if (brands.length === 0) {
      console.warn("No brands found in the database. Please check your DB/collection.");
      return;
    }

    // Build simple mapping: Brand Name (or id), Image Filename (not full path)
    const lines = brands.map((brand: any) => {
      // Prefer designation_fr, fallback to name, slug, id, or _id
      const brandNameOrId = (brand.designation_fr || brand.name || brand.slug || brand.id || brand._id || "").toString().replace(/[\r\n,]/g, " ").trim();
      // Extract only the filename from the logo path
      let imageFilename = "";
      if (brand.logo) {
        const parts = brand.logo.split("/");
        imageFilename = parts[parts.length - 1];
      }
      return `${brandNameOrId},${imageFilename}`;
    });

    // Write to plain text file
    fs.writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf-8");
    console.log(`Brand image simple mapping exported to ${OUTPUT_PATH}`);
    console.log("Sample output:");
    console.log(lines.slice(0, 5).join("\n"));
  } catch (err) {
    console.error("Error fetching brands:", err);
  } finally {
    await client.close();
  }
}

main();