import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'contacto@tropical-vitamin.com';
  const password = 'Contacto_26';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Admin',
      isActive: true,
    },
  });

  console.log('Usuario creado/actualizado:', {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });