// Script to extract all blog cover image paths from MongoDB and write to a file
// Usage: node extract_blog_image_paths.js

const fs = require('fs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'protein_db';
const COLLECTION_NAME = 'blogs';
const OUTPUT_FILE = 'blog_image_paths.txt';

async function main() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const blogs = await collection.find({}).toArray();

    const imagePaths = new Set();
    blogs.forEach(blog => {
      if (blog.cover) {
        if (typeof blog.cover === 'string') {
          imagePaths.add(blog.cover);
        } else if (blog.cover.url) {
          imagePaths.add(blog.cover.url);
        }
      }
    });

    const output = Array.from(imagePaths).join('\n');
    fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
    console.log(`Extracted ${imagePaths.size} image paths to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();