const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@coffeeninja.com' },
        update: {},
        create: {
            email: 'admin@coffeeninja.com',
            name: 'Admin User',
            passwordHash: hashedPassword,
            role: 'ADMIN',
        },
    });

    // Agent User 1
    const agent1 = await prisma.user.upsert({
        where: { email: 'agent1@coffeeninja.com' },
        update: {},
        create: {
            email: 'agent1@coffeeninja.com',
            name: 'Agent One',
            passwordHash: hashedPassword,
            role: 'AGENT',
        },
    });

    console.log('Database seeded successfully!');
    console.log({ admin: admin.email, agent1: agent1.email });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });