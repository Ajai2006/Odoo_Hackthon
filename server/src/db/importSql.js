import { seedDatabase } from './seed.js';

console.log('🔄 Executing offline DB import and seeding...');
seedDatabase();
console.log('✅ Fully offline DB import & seeding complete!');
