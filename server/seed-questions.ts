import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultAnswer = "smith";
  const hashedAnswer = await bcrypt.hash(defaultAnswer, 10);
  
  const result = await prisma.user.updateMany({
    where: {
      security_question: null
    },
    data: {
      security_question: "What is your mother's maiden name?",
      security_answer: hashedAnswer
    }
  });

  console.log(`Updated ${result.count} users with a default security question and answer.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
