const XLSX = require('xlsx');
const fs = require('fs');

console.log('=== ANNUITY WORKBOOK ===\n');
const annuityWb = XLSX.readFile('Apex Annuity Grid by levels.xlsx');
console.log('Sheet Names:', annuityWb.SheetNames);
console.log('\n');

let annuityOutput = '';
annuityWb.SheetNames.forEach(sheetName => {
  console.log('========================================');
  console.log('SHEET:', sheetName);
  console.log('========================================');
  const sheet = annuityWb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  data.forEach(row => {
    const line = row.join(' | ');
    if (line.trim()) {
      console.log(line);
      annuityOutput += line + '\n';
    }
  });
  console.log('\n');
});

console.log('\n\n=== LIFE INSURANCE WORKBOOK ===\n');
const lifeWb = XLSX.readFile('Apex Life Grid by levels (2).xlsx');
console.log('Sheet Names:', lifeWb.SheetNames);
console.log('\n');

let lifeOutput = '';
lifeWb.SheetNames.forEach(sheetName => {
  console.log('========================================');
  console.log('SHEET:', sheetName);
  console.log('========================================');
  const sheet = lifeWb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  data.forEach(row => {
    const line = row.join(' | ');
    if (line.trim()) {
      console.log(line);
      lifeOutput += line + '\n';
    }
  });
  console.log('\n');
});

fs.writeFileSync('annuity-data.txt', annuityOutput);
fs.writeFileSync('life-data.txt', lifeOutput);
console.log('\n✅ Data saved to annuity-data.txt and life-data.txt');
