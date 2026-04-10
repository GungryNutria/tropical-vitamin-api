import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories with translations...');

  const categories = [
    { adminName: 'aquatic', descriptionES: 'Tours acuáticos y actividades en el agua', descriptionEN: 'Water activities and aquatic tours' },
    { adminName: 'adventure', descriptionES: 'Aventura y actividades emocionantes', descriptionEN: 'Adventure and thrilling activities' },
    { adminName: 'parks', descriptionES: 'Parques temáticos y naturales', descriptionEN: 'Theme parks and natural parks' },
    { adminName: 'archaeological', descriptionES: 'Zonas arqueológicas y ruinas mayas', descriptionEN: 'Archaeological sites and Mayan ruins' },
    { adminName: 'extreme-adventure', descriptionES: 'Aventuras extremas y deportes de adrenalina', descriptionEN: 'Extreme adventures and adrenaline sports' },
    { adminName: 'nature', descriptionES: 'Tours de naturaleza y paisajes naturales', descriptionEN: 'Nature tours and natural landscapes' },
    { adminName: 'wildlife', descriptionES: 'Experiencias con vida silvestre', descriptionEN: 'Wildlife experiences' },
    { adminName: 'islands', descriptionES: 'Tours a islas y excursiones insulares', descriptionEN: 'Island tours and excursions' },
    { adminName: 'night-entertainment', descriptionES: 'Entretenimiento nocturno y vida nocturna', descriptionEN: 'Night entertainment and nightlife' },
  ];

  // Get languages
  const spanish = await prisma.language.findFirst({ where: { code: 'es' } });
  const english = await prisma.language.findFirst({ where: { code: 'en' } });

  if (!spanish || !english) {
    console.error('Languages not found. Run the main seed first.');
    process.exit(1);
  }

  // Delete existing categories and translations (cascade)
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();

  for (const cat of categories) {
    const category = await prisma.category.create({
      data: {
        adminName: cat.adminName,
        description: cat.descriptionES,
        translations: {
          create: [
            {
              languageId: spanish.id,
              name: cat.adminName.charAt(0).toUpperCase() + cat.adminName.slice(1).replace(/-/g, ' '),
              description: cat.descriptionES,
            },
            {
              languageId: english.id,
              name: cat.adminName.charAt(0).toUpperCase() + cat.adminName.slice(1).replace(/-/g, ' '),
              description: cat.descriptionEN,
            },
          ],
        },
      },
      include: {
        translations: true,
      },
    });
    console.log(`Created category: ${category.adminName}`);
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });