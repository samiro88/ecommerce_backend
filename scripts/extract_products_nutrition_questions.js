const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection details
const MONGODB_URI = "mongodb://localhost:27017/protein_db";
const DB_NAME = "protein_db";
const COLLECTION_NAME = "products"; // Change if your collection name is different

async function main() {
  // Removed deprecated useUnifiedTopology option
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Query all products
    const products = await collection.find(
      {},
      { projection: { _id: 1, designation_fr: 1, nutrition_values: 1, questions: 1 } }
    ).toArray();

    // Counters for products with nutrition facts and questions
    let countNutrition = 0;
    let countQuestions = 0;
    let countBoth = 0;

    const outputFile = "products_nutrition_questions.txt";
    const summaryFile = "products_nutrition_questions_summary.txt";
    const header = `${'ID'.padEnd(25)} | ${'Product Name'.padEnd(40)} | ${'Nutrition Fact'.padEnd(40)} | Questions\n`;
    const separator = '='.repeat(160) + '\n';
    let table = header + separator;

    let details = '';

    for (const product of products) {
      const prod_id = String(product._id ?? '');
      const name = product.designation_fr ?? '';
      const nutrition = product.nutrition_values ?? '';
      const questions = product.questions ?? '';

      // Count products with nutrition facts and/or questions
      const hasNutrition = nutrition && String(nutrition).trim().length > 0;
      const hasQuestions = questions && String(questions).trim().length > 0;
      if (hasNutrition) countNutrition++;
      if (hasQuestions) countQuestions++;
      if (hasNutrition && hasQuestions) countBoth++;

      // Format for table output (truncate long fields for table, but write full below)
      const nutrition_short = hasNutrition && nutrition.length > 40 ? nutrition.slice(0, 37) + '...' : nutrition;
      const questions_short = hasQuestions && questions.length > 40 ? questions.slice(0, 37) + '...' : questions;

      table += `${prod_id.padEnd(25)} | ${name.padEnd(40)} | ${nutrition_short.padEnd(40)} | ${questions_short}\n`;
      table += '-'.repeat(160) + '\n';

      // Write full details below the table for reference
      details += `ID: ${prod_id}\nProduct Name: ${name}\nNutrition Fact:\n${nutrition}\nQuestions:\n${questions}\n`;
      details += '='.repeat(80) + '\n\n';
    }

    fs.writeFileSync(outputFile, table + '\n' + details, { encoding: 'utf-8' });

    // Write summary file
    const summary = [
      `Database Name: ${DB_NAME}`,
      `Collection Name: ${COLLECTION_NAME}`,
      `Total Products: ${products.length}`,
      `Products with Nutrition Fact: ${countNutrition}`,
      `Products with Questions: ${countQuestions}`,
      `Products with BOTH Nutrition Fact and Questions: ${countBoth}`,
      '',
      'Note: "Nutrition Fact" and "Questions" are counted as present if the field exists and is not empty.'
    ].join('\n');

    fs.writeFileSync(summaryFile, summary, { encoding: 'utf-8' });

    console.log(`Extraction complete! See ${outputFile} for results.`);
    console.log(`Summary complete! See ${summaryFile} for summary results.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

main();