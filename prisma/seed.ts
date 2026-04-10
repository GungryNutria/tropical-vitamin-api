import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Languages
  console.log('Seeding languages...');
  const languages = await Promise.all([
    prisma.language.upsert({
      where: { code: 'es' },
      update: {},
      create: { code: 'es', name: 'Español', isActive: true },
    }),
    prisma.language.upsert({
      where: { code: 'en' },
      update: {},
      create: { code: 'en', name: 'English', isActive: true },
    }),
  ]);
  console.log('Languages created:', languages);

  // Seed Categories
  console.log('Seeding categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: { 
        adminName: 'snorkel',
        description: 'Tours de snorkel y buceo',
      },
    }),
    prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: { 
        adminName: 'fishing',
        description: 'Tours de pesca deportiva',
      },
    }),
    prisma.category.upsert({
      where: { id: 3 },
      update: {},
      create: { 
        adminName: 'adventure',
        description: 'Tours de aventura y exploración',
      },
    }),
  ]);
  console.log('Categories created:', categories);

  // Seed Category Translations
  console.log('Seeding category translations...');
  await Promise.all([
    // Snorkel - ES
    prisma.categoryTranslation.upsert({
      where: { categoryId_languageId: { categoryId: 1, languageId: 1 } },
      update: { name: 'Snorkel', description: 'Tours de snorkel y buceo en los mejores arrecifes' },
      create: { categoryId: 1, languageId: 1, name: 'Snorkel', description: 'Tours de snorkel y buceo en los mejores arrecifes' },
    }),
    // Snorkel - EN
    prisma.categoryTranslation.upsert({
      where: { categoryId_languageId: { categoryId: 1, languageId: 2 } },
      update: { name: 'Snorkeling', description: 'Snorkeling and diving tours at the best reefs' },
      create: { categoryId: 1, languageId: 2, name: 'Snorkeling', description: 'Snorkeling and diving tours at the best reefs' },
    }),
    // Fishing - ES
    prisma.categoryTranslation.upsert({
      where: { categoryId_languageId: { categoryId: 2, languageId: 1 } },
      update: { name: 'Pesca', description: 'Tours de pesca deportiva' },
      create: { categoryId: 2, languageId: 1, name: 'Pesca', description: 'Tours de pesca deportiva' },
    }),
    // Fishing - EN
    prisma.categoryTranslation.upsert({
      where: { categoryId_languageId: { categoryId: 2, languageId: 2 } },
      update: { name: 'Fishing', description: 'Sport fishing tours' },
      create: { categoryId: 2, languageId: 2, name: 'Fishing', description: 'Sport fishing tours' },
    }),
    // Adventure - ES
    prisma.categoryTranslation.upsert({
      where: { categoryId_languageId: { categoryId: 3, languageId: 1 } },
      update: { name: 'Aventura', description: 'Tours de aventura y exploración' },
      create: { categoryId: 3, languageId: 1, name: 'Aventura', description: 'Tours de aventura y exploración' },
    }),
    // Adventure - EN
    prisma.categoryTranslation.upsert({
      where: { categoryId_languageId: { categoryId: 3, languageId: 2 } },
      update: { name: 'Adventure', description: 'Adventure and exploration tours' },
      create: { categoryId: 3, languageId: 2, name: 'Adventure', description: 'Adventure and exploration tours' },
    }),
  ]);
  console.log('Category translations created');

  // Update tour's categoryId to use existing category
  await prisma.tour.updateMany({
    data: { categoryId: 1 },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });