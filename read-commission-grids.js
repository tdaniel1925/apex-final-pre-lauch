const XLSX = require('xlsx');

console.log('\n=== ANNUITY GRID ===\n');
const annuityWorkbook = XLSX.readFile('Apex Annuity Grid by levels.xlsx');
const annuitySheet = annuityWorkbook.Sheets[annuityWorkbook.SheetNames[0]];
const annuityData = XLSX.utils.sheet_to_json(annuitySheet, { header: 1 });
annuityData.forEach(row => console.log(row.join(' | ')));

console.log('\n\n=== LIFE GRID ===\n');
const lifeWorkbook = XLSX.readFile('Apex Life Grid by levels (2).xlsx');
const lifeSheet = lifeWorkbook.Sheets[lifeWorkbook.SheetNames[0]];
const lifeData = XLSX.utils.sheet_to_json(lifeSheet, { header: 1 });
lifeData.forEach(row => console.log(row.join(' | ')));
