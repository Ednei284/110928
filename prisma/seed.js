// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const passwordPadrao = 'senhaSegura123';
  const hashedPassword = await bcrypt.hash(passwordPadrao, 10);

  // cria apenas um usuário
  const user = await prisma.user.create({
    data: {
      email: 'metal2024heavy@gmail.com',
      name: 'Ednei',
      password: hashedPassword
    }
  });

  console.log('Usuário criado:', user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
