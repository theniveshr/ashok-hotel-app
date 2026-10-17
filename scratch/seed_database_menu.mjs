import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive Menu & Room seed...');

  const branchId = '00000000-0000-0000-0000-000000000001';

  // 1. Update Room Types with proper real images
  const roomImages = {
    '00000000-0000-0000-0001-000000000001': ['https://www.ashokrajgroups.com/images/Lodge/single-ac.jpg'],
    '00000000-0000-0000-0001-000000000002': ['https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp'],
    '00000000-0000-0000-0001-000000000003': ['https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp'],
  };

  for (const [id, urls] of Object.entries(roomImages)) {
    try {
      await prisma.roomType.update({
        where: { id },
        data: { imageUrls: urls },
      });
      console.log(`✅ Updated RoomType ${id} image`);
    } catch (e) {
      console.warn(`Could not update RoomType ${id}:`, e.message);
    }
  }

  // 2. Read categories and items from useMenuStore.ts
  const content = fs.readFileSync('../../frontend/mobile/store/useMenuStore.ts', 'utf8');

  // Evaluate mockCategories and mockMenuItems cleanly
  // Extract mockCategories substring
  const catStart = content.indexOf('export const mockCategories: ExtendedMenuCategory[] = [');
  const catEnd = content.indexOf('export const mockMenuItems: MenuItem[] = [');
  const catCode = content.substring(catStart, catEnd).replace('export const mockCategories: ExtendedMenuCategory[] =', 'const categories =') + '; return categories;';
  const categories = new Function(catCode)();

  console.log(`Loaded ${categories.length} categories.`);

  for (const cat of categories) {
    await prisma.menuCategory.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        nameTa: cat.nameTa,
        description: cat.description,
        descriptionTa: cat.descriptionTa,
        displayOrder: cat.displayOrder,
        isActive: true,
        branchId,
      },
      create: {
        id: cat.id,
        name: cat.name,
        nameTa: cat.nameTa,
        description: cat.description,
        descriptionTa: cat.descriptionTa,
        displayOrder: cat.displayOrder,
        isActive: true,
        branchId,
      },
    });
  }
  console.log('✅ Upserted all 17 categories.');

  // Extract mockMenuItems substring
  const itemsStart = content.indexOf('export const mockMenuItems: MenuItem[] = [');
  const itemsEnd = content.indexOf('export const useMenuStore', itemsStart);
  const itemsCode = content.substring(itemsStart, itemsEnd).replace('export const mockMenuItems: MenuItem[] =', 'const items =') + '; return items;';
  const items = new Function(itemsCode)();

  console.log(`Loaded ${items.length} menu items.`);

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        categoryId: item.categoryId,
        name: item.name,
        nameTa: item.nameTa,
        description: item.description,
        descriptionTa: item.descriptionTa,
        price: item.price,
        discountPercentage: item.discountPercentage || 0,
        imageUrl: item.imageUrl,
        isVegetarian: Boolean(item.isVegetarian),
        isVegan: Boolean(item.isVegan),
        isGlutenFree: Boolean(item.isGlutenFree),
        isSpicy: Boolean(item.isSpicy),
        isBestseller: Boolean(item.isBestseller),
        isFeatured: Boolean(item.isFeatured),
        preparationTimeMinutes: item.preparationTimeMinutes || 15,
        isAvailable: item.isAvailable !== false,
        displayOrder: item.displayOrder || 0,
        rating: item.rating || 4.8,
        reviewCount: item.reviewCount || 42,
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        tags: item.tags || [],
      },
      create: {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        nameTa: item.nameTa,
        description: item.description,
        descriptionTa: item.descriptionTa,
        price: item.price,
        discountPercentage: item.discountPercentage || 0,
        imageUrl: item.imageUrl,
        isVegetarian: Boolean(item.isVegetarian),
        isVegan: Boolean(item.isVegan),
        isGlutenFree: Boolean(item.isGlutenFree),
        isSpicy: Boolean(item.isSpicy),
        isBestseller: Boolean(item.isBestseller),
        isFeatured: Boolean(item.isFeatured),
        preparationTimeMinutes: item.preparationTimeMinutes || 15,
        isAvailable: item.isAvailable !== false,
        displayOrder: item.displayOrder || 0,
        rating: item.rating || 4.8,
        reviewCount: item.reviewCount || 42,
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        tags: item.tags || [],
      },
    });
  }
  console.log(`✅ Upserted ${items.length} menu items into database.`);

  const count = await prisma.menuItem.count();
  console.log(`🎉 Total menu items now in database: ${count}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
