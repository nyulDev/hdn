const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const admins = {
  "admin1@haluan.id": "admin1",
  "admin2@haluan.id": "admin2",
  "admin3@haluan.id": "admin3",
  "admin4@haluan.id": "admin4",
  "admin5@haluan.id": "admin5",
  "nyulmac93@gmail.com": "Passwordapa",
  "adminhdn@gmail.com": "zxcvbnm",
};

async function main() {
  for (const [email, password] of Object.entries(admins)) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          password,
          name: email.split("@")[0],
          role: "admin",
          status: "active",
        },
      });
      console.log(`Created admin: ${email}`);
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          password,
          role: "admin",
          status: "active",
        }
      });
      console.log(`Updated admin: ${email}`);
    }
  }
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
