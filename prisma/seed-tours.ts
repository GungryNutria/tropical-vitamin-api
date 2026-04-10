import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category mapping from Spanish names to admin names
const categoryMap: Record<string, string> = {
  'Acuaticos': 'aquatic',
  'Aventura': 'adventure',
  'Parques': 'parks',
  'Arqueologicos': 'archaeological',
  'Extremos y Aventura': 'extreme-adventure',
  'Naturaleza': 'nature',
  'Vida Silvestre': 'wildlife',
  'Islas': 'islands',
  'Entretenimiento Nocturno': 'night-entertainment',
};

// Duration mapping
const durationMap: Record<string, number> = {
  '4 horas': 240,
  '30 minutos': 30,
  '1 hora': 60,
  '15 minutos': 15,
  'Todo el día': 480,
  'Tarde - Noche': 300,
  'Medio día': 180,
  'Noche': 240,
};

interface TourData {
  es: { title: string; description: string; category: string; duration: string };
  en: { title: string; description: string; category: string; duration: string };
  id: number;
}

const toursData: TourData[] = [
  { id: 1, es: { title: 'Snorkel & Buceo', description: 'Explora arrecifes cristalinos y vive la experiencia de nadar entre peces tropicales.', category: 'Acuaticos', duration: '4 horas' }, en: { title: 'Snorkel & Diving', description: 'Explore crystal clear reefs and experience swimming among tropical fish.', category: 'Aquatic', duration: '4 hours' } },
  { id: 2, es: { title: 'Motos Acuáticas', description: 'Siente la adrenalina recorriendo el mar a toda velocidad en motos acuáticas.', category: 'Aventura', duration: '30 minutos' }, en: { title: 'Jet Skis', description: 'Feel the adrenaline racing across the sea at full speed on jet skis.', category: 'Adventure', duration: '30 minutes' } },
  { id: 3, es: { title: 'Speed Boats', description: 'Recorre canales y mar abierto a gran velocidad mientras conduces tu propio speed boat.', category: 'Acuaticos', duration: '1 hora' }, en: { title: 'Speed Boats', description: 'Navigate channels and open sea at high speed while driving your own speed boat.', category: 'Aquatic', duration: '1 hour' } },
  { id: 4, es: { title: 'Parasailing', description: 'Disfruta vistas espectaculares del mar mientras vuelas sobre el agua en una experiencia inolvidable.', category: 'Acuaticos', duration: '15 minutos' }, en: { title: 'Parasailing', description: 'Enjoy spectacular views of the sea while flying over the water in an unforgettable experience.', category: 'Aquatic', duration: '15 minutes' } },
  { id: 5, es: { title: 'Catamaran', description: 'Navega en catamarán y disfruta del mar con música, bebidas y un ambiente relajado.', category: 'Acuaticos', duration: '4 horas' }, en: { title: 'Catamaran', description: 'Sail on a catamaran and enjoy the sea with music, drinks and a relaxed atmosphere.', category: 'Aquatic', duration: '4 hours' } },
  { id: 6, es: { title: 'Yate', description: 'Vive una experiencia de lujo navegando en yate con comodidad, privacidad y vistas increíbles.', category: 'Acuaticos', duration: '4 horas' }, en: { title: 'Yacht', description: 'Experience luxury sailing on a yacht with comfort, privacy and incredible views.', category: 'Aquatic', duration: '4 hours' } },
  { id: 7, es: { title: 'Xcaret', description: 'Vive un parque eco-arqueológico con ríos subterráneos, espectáculos y cultura mexicana.', category: 'Parques', duration: 'Todo el día' }, en: { title: 'Xcaret', description: 'Experience an eco-archaeological park with underground rivers, shows and Mexican culture.', category: 'Parks', duration: 'All day' } },
  { id: 8, es: { title: 'Xel-Há', description: 'Disfruta un parque natural todo incluido con snorkel, ríos y naturaleza sin límites.', category: 'Parques', duration: 'Todo el día' }, en: { title: 'Xel-Há', description: 'Enjoy an all-inclusive natural park with snorkeling, rivers and unlimited nature.', category: 'Parks', duration: 'All day' } },
  { id: 9, es: { title: 'Xplor (Día)', description: 'Vive una aventura extrema con tirolesas, ríos subterráneos y vehículos anfibios.', category: 'Parques', duration: 'Todo el día' }, en: { title: 'Xplor (Day)', description: 'Experience extreme adventure with ziplines, underground rivers and amphibious vehicles.', category: 'Parks', duration: 'All day' } },
  { id: 10, es: { title: 'Xplor Fuego', description: 'Disfruta Xplor de noche con tirolesas, ríos y aventuras iluminadas por antorchas.', category: 'Parques', duration: 'Tarde - Noche' }, en: { title: 'Xplor Fire', description: 'Enjoy Xplor at night with ziplines, rivers and adventures illuminated by torches.', category: 'Parks', duration: 'Evening - Night' } },
  { id: 11, es: { title: 'Xenses', description: 'Un parque sensorial que desafía tus sentidos con experiencias únicas y sorprendentes.', category: 'Parques', duration: 'Medio día' }, en: { title: 'Xenses', description: 'A sensory park that challenges your senses with unique and surprising experiences.', category: 'Parks', duration: 'Half day' } },
  { id: 12, es: { title: 'Chichén Itzá', description: 'Visita una de las siete maravillas del mundo y descubre la grandeza de la civilización maya.', category: 'Arqueologicos', duration: 'Todo el día' }, en: { title: 'Chichén Itzá', description: 'Visit one of the seven wonders of the world and discover the greatness of the Mayan civilization.', category: 'Archaeological', duration: 'All day' } },
  { id: 13, es: { title: 'Tulum', description: 'Explora las ruinas mayas frente al mar Caribe con vistas espectaculares.', category: 'Arqueologicos', duration: 'Todo el día' }, en: { title: 'Tulum', description: 'Explore Mayan ruins facing the Caribbean Sea with spectacular views.', category: 'Archaeological', duration: 'All day' } },
  { id: 14, es: { title: 'Cobá', description: 'Recorre antiguas ruinas mayas rodeadas de selva y pirámides imponentes.', category: 'Arqueologicos', duration: 'Todo el día' }, en: { title: 'Cobá', description: 'Explore ancient Mayan ruins surrounded by jungle and imposing pyramids.', category: 'Archaeological', duration: 'All day' } },
  { id: 15, es: { title: 'Ek Balam', description: 'Descubre una zona arqueológica maya con impresionantes esculturas y arquitectura.', category: 'Arqueologicos', duration: 'Todo el día' }, en: { title: 'Ek Balam', description: 'Discover a Mayan archaeological zone with impressive sculptures and architecture.', category: 'Archaeological', duration: 'All day' } },
  { id: 16, es: { title: 'Uxmal', description: 'Admira una joya del mundo maya famosa por su arquitectura y detalles únicos.', category: 'Arqueologicos', duration: 'Todo el día' }, en: { title: 'Uxmal', description: 'Admire a jewel of the Mayan world famous for its architecture and unique details.', category: 'Archaeological', duration: 'All day' } },
  { id: 17, es: { title: 'Tirolesas', description: 'Vuela sobre la selva en un emocionante recorrido lleno de adrenalina.', category: 'Extremos y Aventura', duration: 'Medio día' }, en: { title: 'Ziplines', description: 'Fly over the jungle on an exciting zipline course full of adrenaline.', category: 'Extreme & Adventure', duration: 'Half day' } },
  { id: 18, es: { title: 'ATV', description: 'Conduce cuatrimotos a través de caminos selváticos y terrenos extremos.', category: 'Extremos y Aventura', duration: 'Medio día' }, en: { title: 'ATV', description: 'Drive quads through jungle paths and extreme terrain.', category: 'Extreme & Adventure', duration: 'Half day' } },
  { id: 19, es: { title: 'Razer', description: 'Vive una aventura off-road manejando vehículos todo terreno de alta potencia.', category: 'Extremos y Aventura', duration: 'Medio día' }, en: { title: 'Razer', description: 'Experience off-road adventure driving high-powered all-terrain vehicles.', category: 'Extreme & Adventure', duration: 'Half day' } },
  { id: 20, es: { title: 'Rappel', description: 'Desciende por paredes naturales y siente la emoción del rappel en la selva.', category: 'Extremos y Aventura', duration: 'Medio día' }, en: { title: 'Rappelling', description: 'Descend natural walls and feel the excitement of rappelling in the jungle.', category: 'Extreme & Adventure', duration: 'Half day' } },
  { id: 21, es: { title: 'Buggy', description: 'Explora senderos salvajes en buggy y disfruta una experiencia llena de acción.', category: 'Extremos y Aventura', duration: 'Medio día' }, en: { title: 'Buggy', description: 'Explore wild trails in a buggy and enjoy an action-packed experience.', category: 'Extreme & Adventure', duration: 'Half day' } },
  { id: 22, es: { title: 'Cenotes', description: 'Nada en cenotes de aguas cristalinas rodeados de naturaleza y tranquilidad.', category: 'Naturaleza', duration: 'Medio día' }, en: { title: 'Cenotes', description: 'Swim in crystal clear cenotes surrounded by nature and tranquility.', category: 'Nature', duration: 'Half day' } },
  { id: 23, es: { title: 'Bacalar', description: 'Descubre la Laguna de los Siete Colores y disfruta un paraíso natural único.', category: 'Naturaleza', duration: 'Todo el día' }, en: { title: 'Bacalar', description: 'Discover the Lagoon of Seven Colors and enjoy a unique natural paradise.', category: 'Nature', duration: 'All day' } },
  { id: 24, es: { title: 'Lagunas', description: 'Explora hermosas lagunas naturales y relájate en entornos paradisíacos.', category: 'Naturaleza', duration: 'Medio día' }, en: { title: 'Lagoons', description: 'Explore beautiful natural lagoons and relax in paradise settings.', category: 'Nature', duration: 'Half day' } },
  { id: 25, es: { title: 'Río Lagartos', description: 'Admira flamencos, manglares y paisajes únicos en una reserva natural protegida.', category: 'Naturaleza', duration: 'Todo el día' }, en: { title: 'Río Lagartos', description: 'Admire flamingos, mangroves and unique landscapes in a protected natural reserve.', category: 'Nature', duration: 'All day' } },
  { id: 26, es: { title: 'Nado con Tortugas', description: 'Nada junto a tortugas marinas en su hábitat natural.', category: 'Vida Silvestre', duration: 'Medio día' }, en: { title: 'Swim with Turtles', description: 'Swim with sea turtles in their natural habitat.', category: 'Wildlife', duration: 'Half day' } },
  { id: 27, es: { title: 'Nado con Tiburón Ballena', description: 'Vive una experiencia única nadando con el pez más grande del mundo.', category: 'Vida Silvestre', duration: 'Todo el día' }, en: { title: 'Swim with Whale Shark', description: 'Experience a unique swimming with the biggest fish in the world.', category: 'Wildlife', duration: 'All day' } },
  { id: 28, es: { title: 'Paseo a Caballo', description: 'Disfruta un tranquilo paseo a caballo rodeado de naturaleza.', category: 'Vida Silvestre', duration: 'Medio día' }, en: { title: 'Horseback Riding', description: 'Enjoy a peaceful horseback ride surrounded by nature.', category: 'Wildlife', duration: 'Half day' } },
  { id: 29, es: { title: 'Paseo en Camello', description: 'Una experiencia diferente y exótica con paseo en camello.', category: 'Vida Silvestre', duration: 'Medio día' }, en: { title: 'Camel Ride', description: 'A different and exotic experience with camel riding.', category: 'Wildlife', duration: 'Half day' } },
  { id: 30, es: { title: 'Nado con Delfines', description: 'Interactúa y nada con delfines en una experiencia inolvidable.', category: 'Vida Silvestre', duration: 'Medio día' }, en: { title: 'Swim with Dolphins', description: 'Interact and swim with dolphins in an unforgettable experience.', category: 'Wildlife', duration: 'Half day' } },
  { id: 31, es: { title: 'Isla Mujeres', description: 'Disfruta playas de arena blanca y aguas cristalinas en una isla paradisíaca.', category: 'Islas', duration: 'Todo el día' }, en: { title: 'Isla Mujeres', description: 'Enjoy white sand beaches and crystal clear waters in a paradise island.', category: 'Islands', duration: 'All day' } },
  { id: 32, es: { title: 'Isla Cozumel', description: 'Explora una isla famosa por su arrecife, playas y ambiente relajado.', category: 'Islas', duration: 'Todo el día' }, en: { title: 'Isla Cozumel', description: 'Explore an island famous for its reef, beaches and relaxed atmosphere.', category: 'Islands', duration: 'All day' } },
  { id: 33, es: { title: 'Isla Contoy', description: 'Visita una reserva natural protegida con playas vírgenes y fauna única.', category: 'Islas', duration: 'Todo el día' }, en: { title: 'Isla Contoy', description: 'Visit a protected natural reserve with virgin beaches and unique wildlife.', category: 'Islands', duration: 'All day' } },
  { id: 34, es: { title: 'Isla Holbox', description: 'Descubre una isla bohemia con playas tranquilas y paisajes inolvidables.', category: 'Islas', duration: 'Todo el día' }, en: { title: 'Isla Holbox', description: 'Discover a bohemian island with quiet beaches and unforgettable landscapes.', category: 'Islands', duration: 'All day' } },
  { id: 35, es: { title: 'Coco Bongo', description: 'Vive el show nocturno más famoso de Cancún con música, acrobacias y fiesta.', category: 'Entretenimiento Nocturno', duration: 'Noche' }, en: { title: 'Coco Bongo', description: 'Experience the most famous night show in Cancún with music, acrobatics and party.', category: 'Night Entertainment', duration: 'Night' } },
  { id: 36, es: { title: 'Xochimilco', description: 'Fiesta mexicana con música en vivo, comida típica y ambiente festivo.', category: 'Entretenimiento Nocturno', duration: 'Noche' }, en: { title: 'Xochimilco', description: 'Mexican party with live music, typical food and festive atmosphere.', category: 'Night Entertainment', duration: 'Night' } },
  { id: 37, es: { title: 'Joya Cirque du Soleil', description: 'Espectáculo impresionante que combina acrobacias, teatro y gastronomía.', category: 'Entretenimiento Nocturno', duration: 'Noche' }, en: { title: 'Joya Cirque du Soleil', description: 'Impressive show combining acrobatics, theater and gastronomy.', category: 'Night Entertainment', duration: 'Night' } },
  { id: 38, es: { title: 'Barco Pirata', description: 'Show familiar con piratas, música y diversión en altamar.', category: 'Entretenimiento Nocturno', duration: 'Noche' }, en: { title: 'Pirate Ship', description: 'Family show with pirates, music and fun on the high seas.', category: 'Night Entertainment', duration: 'Night' } },
  { id: 39, es: { title: 'Night Clubs', description: 'Acceso a los mejores antros y clubs nocturnos de la zona.', category: 'Entretenimiento Nocturno', duration: 'Noche' }, en: { title: 'Night Clubs', description: 'Access to the best clubs and nightspots in the area.', category: 'Night Entertainment', duration: 'Night' } },
];

async function main() {
  console.log('Seeding tours...');

  const spanish = await prisma.language.findFirst({ where: { code: 'es' } });
  const english = await prisma.language.findFirst({ where: { code: 'en' } });
  const categories = await prisma.category.findMany();

  if (!spanish || !english) {
    console.error('Languages not found. Run the main seed first.');
    process.exit(1);
  }

  // Create category lookup
  const categoryLookup: Record<string, number> = {};
  for (const cat of categories) {
    categoryLookup[cat.adminName] = cat.id;
  }

  // Map English category names to admin names
  const enToAdmin: Record<string, string> = {
    'Aquatic': 'aquatic',
    'Adventure': 'adventure',
    'Parks': 'parks',
    'Archaeological': 'archaeological',
    'Extreme & Adventure': 'extreme-adventure',
    'Nature': 'nature',
    'Wildlife': 'wildlife',
    'Islands': 'islands',
    'Night Entertainment': 'night-entertainment',
  };

  for (const tourData of toursData) {
    // Get category ID from Spanish category name
    const categoryAdminName = categoryMap[tourData.es.category];
    const categoryId = categoryLookup[categoryAdminName];

    if (!categoryId) {
      console.warn(`Category not found for: ${tourData.es.category}, skipping tour: ${tourData.es.title}`);
      continue;
    }

    const tour = await prisma.tour.create({
      data: {
        adminTitle: tourData.es.title, // Use Spanish title as admin title
        price: 1000, // Default price
        location: 'Cancún, México',
        duration: durationMap[tourData.es.duration] || 60,
        isActive: true,
        categoryId: categoryId,
        translations: {
          create: [
            {
              languageId: spanish.id,
              title: tourData.es.title,
              description: tourData.es.description,
            },
            {
              languageId: english.id,
              title: tourData.en.title,
              description: tourData.en.description,
            },
          ],
        },
      },
      include: {
        translations: true,
      },
    });

    console.log(`Created tour: ${tourData.es.title}`);
  }

  console.log('Tours seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });