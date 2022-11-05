// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

const sleep = async (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const tryDBConnect = async () => {
  let succeeded = false;
  let waitTime = 0;

  for (let i = 1; i <= 30; i++) {
    try {
      console.log('connecting to database...');
      const prismaClient = new PrismaClient();
      await prismaClient.$connect();

      succeeded = true;
      console.log('connection successful');
      break;
    } catch (e) {
      waitTime += i * 2;
      console.log(`connection failed, sleeping for ${i * 2} seconds`);
      console.log('cause:', e);
      await sleep(i * 2);
      continue;
    }
  }

  if (!succeeded) {
    throw Error(
      `Failed to connect to DB after 30 attempts, waited ${waitTime} seconds`,
    );
  }
};

tryDBConnect().then(() => process.exit());
