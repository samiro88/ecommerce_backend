const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "protein_db";
const PRODUCTS_COLLECTION = "products";
const SUBCATEGORIES_COLLECTION = "subcategories";
const CATEGORIES_COLLECTION = "categories";

// Helper to derive type from category/subcategory
function deriveType(category = "", subcategory = "") {
  const c = (category || "").toLowerCase();
  const s = (subcategory || "").toLowerCase();

  if (c.includes("protéines")) return "Powder";
  if (c.includes("prise de masse")) return "Powder";
  if (c.includes("perte de poids") && s.includes("fat burner")) return "Capsule";
  if (c.includes("compléments alimentaires")) {
    if (
      s.includes("zma") ||
      s.includes("omega") ||
      s.includes("vitamin") ||
      s.includes("tribulus") ||
      s.includes("ashwagandha") ||
      s.includes("gélule") ||
      s.includes("caps")
    )
      return "Capsule";
    if (s.includes("tab") || s.includes("tablet")) return "Tablet";
    if (
      s.includes("bcaa") ||
      s.includes("eaa") ||
      s.includes("glutamine") ||
      s.includes("créatine") ||
      s.includes("citrulline") ||
      s.includes("beta alanine")
    )
      return "Powder";
  }
  if (c.includes("équipements") || c.includes("accessoires")) return "Accessory";
  if (c.includes("compléments d'entraînement")) return "Powder";
  return "";
}

// Improved helper to guess type from product name
function guessType(name = "") {
  const n = (name || "").toLowerCase();

  // Accessories and machines first
  if (
    n.includes("machine") ||
    n.includes("press") ||
    n.includes("rack") ||
    n.includes("banc") ||
    n.includes("halter") ||
    n.includes("barbell") ||
    n.includes("curl") ||
    n.includes("row") ||
    n.includes("leg") ||
    n.includes("pec")
  )
    return "Machine";
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
    const products = db.collection(PRODUCTS_COLLECTION);
    const subcategories = db.collection(SUBCATEGORIES_COLLECTION);
    const categories = db.collection(CATEGORIES_COLLECTION);

    // Fetch all categories and build a map: id (string) -> designation_fr
    const catDocs = await categories.find({}, { projection: { id: 1, designation_fr: 1 } }).toArray();
    const catMap = {};
    catDocs.forEach(cat => {
      catMap[cat.id] = cat.designation_fr;
    });

    // Fetch all subcategories and build a map: id (string) -> { designation_fr, categorie_id }
    const subcatDocs = await subcategories.find({}, { projection: { id: 1, designation_fr: 1, categorie_id: 1 } }).toArray();
    const subcatMap = {};
    subcatDocs.forEach(subcat => {
      subcatMap[subcat.id] = {
        designation_fr: subcat.designation_fr,
        categorie_id: subcat.categorie_id
      };
    });

    // Fetch all products
    const prodDocs = await products.find({}, { projection: { _id: 1, designation_fr: 1, type: 1, sous_categorie_id: 1 } }).toArray();

    // Prepare output
    const tableData = prodDocs.map(prod => {
      const subcat = subcatMap[prod.sous_categorie_id] || {};
      const catName = catMap[subcat.categorie_id] || "";
      const derivedType = deriveType(catName, subcat.designation_fr);
      const guessedType = guessType(prod.designation_fr);
      return {
        _id: prod._id.toString(),
        name: prod.designation_fr,
        type: prod.type || "",
        category: catName,
        subcategory: subcat.designation_fr || "",
        derived_type: derivedType,
        guessed_type: guessedType
      };
    });

    // Print as a table for easy inspection
    console.table(tableData);

    // Prepare plain text output
    const header = "_id\tname\ttype\tcategory\tsubcategory\tderived_type\tguessed_type";
    const lines = tableData.map(row =>
      `${row._id}\t${row.name || ""}\t${row.type || ""}\t${row.category || ""}\t${row.subcategory || ""}\t${row.derived_type || ""}\t${row.guessed_type || ""}`
    );
    const output = [header, ...lines].join("\n");

    // Write to file
    const outPath = path.join(__dirname, "product-types-combined.txt");
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`\nSaved output to ${outPath}`);

    console.log(`\nTotal products found: ${prodDocs.length}`);
    console.log("Review the 'derived_type', 'guessed_type', 'category', and 'subcategory' columns for each product.");
  } catch (err) {
    console.error("Error extracting product types with combined logic:", err);
  } finally {
    await client.close();
  }
}

main();