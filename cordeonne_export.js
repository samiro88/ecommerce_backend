const fs = require('fs');
const path = require('path');

const sqlFile = path.resolve(__dirname, '..', 'bd_e_comerce', 'protein_db.sql');
const outputFile = path.resolve(__dirname, 'coordinates.json');

function parseInsertValues(statement) {
  // Extract the values part from the INSERT statement
  const match = statement.match(/INSERT INTO `?coordinates`?\s*\([^)]*\)\s*VALUES\s*(.*);/is);
  if (!match) return [];
  let valuesStr = match[1];
  // Split on '),(' but keep in mind possible quoted commas
  let rows = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    if (char === "'") inQuotes = !inQuotes;
    if (!inQuotes && valuesStr.slice(i, i + 3) === '),(') {
      rows.push(current);
      current = '';
      i += 2;
    } else {
      current += char;
    }
  }
  if (current) rows.push(current);
  // Remove leading/trailing parentheses
  rows = rows.map(r => r.replace(/^\(/, '').replace(/\)$/, ''));
  // Split each row into fields, handling quoted commas
  return rows.map(row => {
    let fields = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === "'") inQuotes = !inQuotes;
      if (!inQuotes && row[i] === ',') {
        fields.push(field === 'NULL' ? null : field.replace(/^'/, '').replace(/'$/, '').replace(/''/g, "'"));
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field === 'NULL' ? null : field.replace(/^'/, '').replace(/'$/, '').replace(/''/g, "'"));
    return fields;
  });
}

function main() {
  if (!fs.existsSync(sqlFile)) {
    console.error('[FAILURE] SQL file not found:', sqlFile);
    return;
  }
  const sql = fs.readFileSync(sqlFile, 'utf8');
  const lines = sql.split(/\r?\n/);
  let coordinatesRows = [];
  let columns = null;
  let matchCount = 0;
  let buffer = '';
  let insideInsert = false;
  for (const line of lines) {
    if (/^INSERT INTO `?coordinates`?/i.test(line)) {
      insideInsert = true;
      buffer = line + '\n';
    } else if (insideInsert) {
      buffer += line + '\n';
    }
    if (insideInsert && /;\s*$/.test(line)) {
      matchCount++;
      // Now process the full statement in buffer
      if (!columns) {
        // Extract column names
        const colMatch = buffer.match(/INSERT INTO `?coordinates`?\s*\(([^)]*)\)/i);
        if (colMatch) {
          columns = colMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
        }
      }
      const values = parseInsertValues(buffer);
      coordinatesRows.push(...values);
      buffer = '';
      insideInsert = false;
    }
  }
  console.log(`[DEBUG] Found ${matchCount} INSERT INTO coordinates statements in SQL file.`);
  if (!columns || coordinatesRows.length === 0) {
    console.log('[FAILURE] No coordinates data found in SQL file.');
    return;
  }
  // Convert to array of objects
  const data = coordinatesRows.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      let val = row[idx];
      if (typeof val === 'string') {
        val = val.trim();
        if (/^null$/i.test(val) || val === '') {
          val = null;
        } else {
          if (val.startsWith("'")) {
            val = val.slice(1);
          }
          if (val.endsWith("'")) {
            val = val.slice(0, -1);
          }
        }
      }
      obj[col] = val;
    });
    return obj;
  });
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
  console.log('[SUCCESS] coordinates data exported to', outputFile);
}

main();
