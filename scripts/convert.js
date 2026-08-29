import fs from 'fs';
import path from 'path';

// Parse CSV handling RFC 4180 quotes
function parseCSV(text) {
  const lines = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        lines.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        lines.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    lines.push(currentRow);
  }

  return lines;
}

const csvPath = path.resolve('colleges_enriched.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

const rows = parseCSV(csvContent.trim());
const header = rows[0].map(h => h.trim());
console.log('Headers:', header);

const dataRows = rows.slice(1);
console.log(`Found ${dataRows.length} data rows`);

function parseNullableNumber(val) {
  if (val === undefined || val === null || val.trim() === '') return null;
  const num = Number(val.trim());
  return isNaN(num) ? null : num;
}

function parseNullableString(val) {
  if (val === undefined || val === null || val.trim() === '') return null;
  return val.trim();
}

const colleges = dataRows.map((row, index) => {
  const rowObj = {};
  header.forEach((colName, colIdx) => {
    rowObj[colName] = row[colIdx];
  });

  return {
    id: index + 1,
    name: rowObj['college_name'].trim(),
    college_code: parseNullableString(rowObj['college_code']),
    year_established: parseNullableNumber(rowObj['year_established']),
    fee_category_a: parseNullableNumber(rowObj['fee_category_a']),
    fee_management_quota: parseNullableNumber(rowObj['fee_management_quota']),
    fee_nri_quota: parseNullableNumber(rowObj['fee_nri_quota']),
    city: rowObj['city'].trim(),
    type: rowObj['type'].trim(),
    lat: parseNullableNumber(rowObj['lat']),
    lng: parseNullableNumber(rowObj['lng']),
    nirf_rank: parseNullableNumber(rowObj['nirf_rank']),
    nirf_score: parseNullableNumber(rowObj['nirf_score']),
    beds: parseNullableNumber(rowObj['beds']),
    google_rating: parseNullableNumber(rowObj['google_rating']),
    google_review_count: parseNullableNumber(rowObj['google_review_count']),
    data_notes: parseNullableString(rowObj['data_notes']),
  };
});

// Verifications
console.log('Total converted colleges:', colleges.length);

const nirfRankCount = colleges.filter(c => c.nirf_rank !== null).length;
console.log('Colleges with NIRF rank:', nirfRankCount);

const codeCount = colleges.filter(c => c.college_code !== null).length;
console.log('Colleges with college_code:', codeCount);

const yearCount = colleges.filter(c => c.year_established !== null).length;
console.log('Colleges with year_established:', yearCount);

const bedsCount = colleges.filter(c => c.beds !== null).length;
console.log('Colleges with beds:', bedsCount);

const anyFeeCount = colleges.filter(c => c.fee_category_a !== null || c.fee_management_quota !== null || c.fee_nri_quota !== null).length;
console.log('Colleges with at least one fee:', anyFeeCount);

const allFeeNullCount = colleges.filter(c => c.fee_category_a === null && c.fee_management_quota === null && c.fee_nri_quota === null).length;
console.log('Colleges with no fee data:', allFeeNullCount);

const reviewsCount = colleges.filter(c => c.google_rating !== null).length;
console.log('Colleges with google_rating:', reviewsCount);

// Save to src/data/colleges.json and root colleges.json
fs.mkdirSync(path.resolve('src/data'), { recursive: true });
fs.writeFileSync(path.resolve('src/data/colleges.json'), JSON.stringify(colleges, null, 2), 'utf8');
fs.writeFileSync(path.resolve('colleges.json'), JSON.stringify(colleges, null, 2), 'utf8');

console.log('Successfully wrote src/data/colleges.json and colleges.json');
