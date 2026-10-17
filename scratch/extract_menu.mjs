import fs from 'fs';

const content = fs.readFileSync('./frontend/mobile/store/useMenuStore.ts', 'utf8');

// Match categories array
const catStart = content.indexOf('export const mockCategories: ExtendedMenuCategory[] = [');
const catEnd = content.indexOf('export const mockMenuItems: MenuItem[] = [');
const catSnippet = content.substring(catStart, catEnd);

// Count how many categories
const catMatches = [...catSnippet.matchAll(/id:\s*'([^']+)'/g)];
console.log('Categories count:', catMatches.length);
console.log('Category IDs:', catMatches.map(m => m[1]));

// Count how many menu items
const itemsSnippet = content.substring(catEnd);
const itemMatches = [...itemsSnippet.matchAll(/id:\s*'([^']+)'/g)];
console.log('Menu items count:', itemMatches.length);
console.log('Sample item IDs:', itemMatches.slice(0, 10).map(m => m[1]));
