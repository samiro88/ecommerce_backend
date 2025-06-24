/**
 * Script: extract-cloudinary-names-from-db.js
 * Purpose: Connects to your database, fetches product image URLs, and extracts Cloudinary public IDs/file names.
 * Usage: node extract-cloudinary-names-from-db.js
 * 
 * NOTE: This example is for MongoDB. For SQL, see the comments below.
 */

const { MongoClient } = require('mongodb');
// const mysql = require('mysql2/promise'); // Uncomment for MySQL

// ==== CONFIGURATION ====
// Update these values for your environment:
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'your_db_name';
const COLLECTION = process.env.COLLECTION || 'products';
const IMAGE_FIELD = 'image'; // or 'images' if it's an array

// For SQL, set up your connection config here
/*
const SQL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'your_db_name'
};
const SQL_QUERY = 'SELECT image FROM products'; // Adjust as needed
*/

// ==== CLOUDINARY URL PARSER ====
function extractCloudinaryName(url) {
  if (!url) return null;
  // Remove query params/hash
  const cleanUrl = url.split(/[?#]/)[0];
  // Find the /upload/ part and get everything after it
  const uploadIndex = cleanUrl.indexOf('/upload/');
  if (uploadIndex === -1) return null;
  const afterUpload = cleanUrl.substring(uploadIndex + 8); // 8 = length of '/upload/'
  return afterUpload;
}

// ==== MAIN FUNCTION ====
async function main() {
  const uniqueNames = new Set();

  // --- MongoDB Example ---
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const products = await db.collection(COLLECTION).find({ [IMAGE_FIELD]: { $exists: true, $ne: null } }).toArray();

    products.forEach(product => {
      let urls = [];
      if (Array.isArray(product[IMAGE_FIELD])) {
        urls = product[IMAGE_FIELD];
      } else if (typeof product[IMAGE_FIELD] === 'string') {
        urls = [product[IMAGE_FIELD]];
      }
      urls.forEach(url => {
        const name = extractCloudinaryName(url);
        if (name) uniqueNames.add(name);
      });
    });

    console.log('\n=== Unique Cloudinary Image Names/IDs from Database ===');
    if (uniqueNames.size === 0) {
      console.log('None found.');
    } else {
      uniqueNames.forEach(name => console.log(name));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }

  // --- MySQL Example ---
  /*
  const connection = await mysql.createConnection(SQL_CONFIG);
  const [rows] = await connection.execute(SQL_QUERY);
  rows.forEach(row => {
    const url = row.image; // or row.images, adjust as needed
    if (url) {
      const name = extractCloudinaryName(url);
      if (name) uniqueNames.add(name);
    }
  });
  await connection.end();
  */
}

main();