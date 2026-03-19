import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ThoughtColor, ThoughtPattern } from '../src/generated/prisma/client';
import { hashPassword } from 'better-auth/crypto';

const databaseUrl = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stickythoughts.com' },
    update: {},
    create: {
      id: 'seed-admin-001',
      name: 'Admin',
      email: 'admin@stickythoughts.com',
      emailVerified: true,
      username: 'thoughtkeeper',
      displayUsername: 'ThoughtKeeper',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create credential account for admin (password: "admin123")
  const hashedPassword = await hashPassword('admin123');
  await prisma.account.upsert({
    where: { id: 'seed-account-admin' },
    update: {},
    create: {
      id: 'seed-account-admin',
      accountId: admin.id,
      providerId: 'credential',
      userId: admin.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log('Created admin credential account (password: admin123)');

  // Create sample users
  const users = await Promise.all(
    [
      {
        id: 'seed-user-001',
        name: 'Juan Dela Cruz',
        email: 'juan@example.com',
        username: 'juandelacruz',
        displayUsername: 'Juan Dela Cruz',
      },
      {
        id: 'seed-user-002',
        name: 'Maria Santos',
        email: 'maria@example.com',
        username: 'mariasantos',
        displayUsername: 'Maria Santos',
      },
      {
        id: 'seed-user-003',
        name: 'Pedro Reyes',
        email: 'pedro@example.com',
        username: 'pedroreyes',
        displayUsername: 'Pedro Reyes',
      },
    ].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ),
  );
  console.log(`Created ${users.length} sample users`);

  // Create sample thoughts
  const thoughts = await Promise.all(
    [
      {
        author: 'Juan Dela Cruz',
        message: 'The best way to predict the future is to create it.',
        color: ThoughtColor.yellow,
        pattern: ThoughtPattern.PLAIN,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Maria Santos',
        message: 'Be kind whenever possible. It is always possible.',
        color: ThoughtColor.red,
        pattern: ThoughtPattern.LINED,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Pedro Reyes',
        message: 'Every accomplishment starts with the decision to try.',
        color: ThoughtColor.green,
        pattern: ThoughtPattern.GRID,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Anonymous',
        message: 'This thought is still waiting for review.',
        color: ThoughtColor.violet,
        pattern: ThoughtPattern.DOTS,
        status: 'PENDING' as const,
      },
      {
        author: 'Juan Dela Cruz',
        message:
          'Sometimes the smallest step in the right direction ends up being the biggest step of your life.',
        color: ThoughtColor.blue,
        pattern: ThoughtPattern.LINED,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Maria Santos',
        message: "You don't have to be perfect to be amazing.",
        color: ThoughtColor.pink,
        pattern: ThoughtPattern.GRID,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Pedro Reyes',
        message: 'Difficult roads often lead to beautiful destinations.',
        color: ThoughtColor.yellow,
        pattern: ThoughtPattern.DOTS,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Anonymous',
        message: 'Be the reason someone smiles today.',
        color: ThoughtColor.green,
        pattern: ThoughtPattern.PLAIN,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Juan Dela Cruz',
        message: 'Your only limit is your mind.',
        color: ThoughtColor.red,
        pattern: ThoughtPattern.GRID,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Maria Santos',
        message: "Stars can't shine without darkness.",
        color: ThoughtColor.violet,
        pattern: ThoughtPattern.DOTS,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Pedro Reyes',
        message: 'Stay patient and trust the journey.',
        color: ThoughtColor.blue,
        pattern: ThoughtPattern.PLAIN,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Anonymous',
        message: 'One day or day one. You decide.',
        color: ThoughtColor.pink,
        pattern: ThoughtPattern.LINED,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Juan Dela Cruz',
        message: "Don't wait for opportunity. Create it.",
        color: ThoughtColor.green,
        pattern: ThoughtPattern.GRID,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Maria Santos',
        message: 'Happiness is not by chance, but by choice.',
        color: ThoughtColor.yellow,
        pattern: ThoughtPattern.DOTS,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Pedro Reyes',
        message: 'What consumes your mind controls your life.',
        color: ThoughtColor.red,
        pattern: ThoughtPattern.LINED,
        status: 'APPROVED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
      {
        author: 'Anonymous',
        message: 'I wonder if anyone else feels this way too.',
        color: ThoughtColor.blue,
        pattern: ThoughtPattern.GRID,
        status: 'PENDING' as const,
      },
      {
        author: 'Someone',
        message: 'This is flagged content for testing moderation.',
        color: ThoughtColor.red,
        pattern: ThoughtPattern.DOTS,
        status: 'FLAGGED' as const,
        statusSetById: admin.id,
        statusSetAt: new Date(),
      },
    ].map((thought) => prisma.thought.create({ data: thought })),
  );
  console.log(`Created ${thoughts.length} sample thoughts`);

  // Highlight "Sometimes the smallest step..." thought (index 4)
  await prisma.thought.update({
    where: { id: thoughts[4].id },
    data: {
      highlightedAt: new Date(),
      highlightedById: admin.id,
    },
  });
  console.log(`Highlighted thought: "${thoughts[4].message}"`);

  // Create sample letters
  const letter1 = await prisma.letter.create({
    data: {
      body: "Hey everyone! Just wanted to share how grateful I am for this community. You all inspire me every day. Let's keep spreading positivity!",
      authorId: users[0].id,
      recipient: 'Everyone',
      status: 'APPROVED',
      statusSetById: admin.id,
      statusSetAt: new Date(),
    },
  });

  const letter2 = await prisma.letter.create({
    data: {
      body: "To whoever needs to hear this: you're doing great. Even on the days when it doesn't feel like it, you are making progress. Keep going.",
      authorId: users[1].id,
      recipient: 'Everyone',
      status: 'APPROVED',
      statusSetById: admin.id,
      statusSetAt: new Date(),
    },
  });

  const letter3 = await prisma.letter.create({
    data: {
      body: "Dear future me, I hope you're proud of how far you've come. Remember the late nights, the doubts, and how you pushed through anyway. You got this.",
      authorId: users[2].id,
      recipient: 'Future Me',
      status: 'APPROVED',
      statusSetById: admin.id,
      statusSetAt: new Date(),
    },
  });

  const letter4 = await prisma.letter.create({
    data: {
      body: 'Thank you to the person who held the door for me today. It was a small thing but it turned my whole day around. Kindness matters more than you know.',
      authorId: users[0].id,
      recipient: 'A Kind Stranger',
      status: 'APPROVED',
      statusSetById: admin.id,
      statusSetAt: new Date(),
    },
  });

  const letter5 = await prisma.letter.create({
    data: {
      body: "To my classmates: let's ace this semester together! Study group this weekend? We got this!",
      authorId: users[1].id,
      recipient: 'My Classmates',
      status: 'APPROVED',
      statusSetById: admin.id,
      statusSetAt: new Date(),
    },
  });

  const letter6 = await prisma.letter.create({
    data: {
      body: "I just want to say that I appreciate each and every one of you. The world is better because you're in it.",
      anonymousFrom: 'A Secret Admirer',
      recipient: 'Everyone',
      status: 'APPROVED',
      statusSetById: admin.id,
      statusSetAt: new Date(),
    },
  });

  const letter7 = await prisma.letter.create({
    data: {
      body: 'This is a pending letter waiting for moderation.',
      authorId: users[2].id,
      recipient: 'Someone',
      status: 'PENDING',
    },
  });

  const letters = [letter1, letter2, letter3, letter4, letter5, letter6, letter7];
  console.log(`Created ${letters.length} sample letters`);

  // Create replies on letters
  const replies = await Promise.all([
    prisma.letterReply.create({
      data: {
        body: 'This is so wholesome! Thank you for sharing.',
        authorId: users[1].id,
        letterId: letter1.id,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: 'Needed this today. Thank you!',
        authorId: users[2].id,
        letterId: letter1.id,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: 'You made my day with this letter!',
        authorId: users[0].id,
        letterId: letter2.id,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: "I'm in! Let's do Saturday afternoon?",
        authorId: users[2].id,
        letterId: letter5.id,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: 'Count me in too! Where should we meet?',
        authorId: users[0].id,
        letterId: letter5.id,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: 'This is beautiful. Sending love back!',
        authorId: users[1].id,
        letterId: letter6.id,
        isAnonymous: true,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: 'So true! Small acts of kindness ripple outward.',
        authorId: users[2].id,
        letterId: letter4.id,
      },
    }),
    prisma.letterReply.create({
      data: {
        body: 'This reminds me to be kinder to myself too.',
        authorId: users[1].id,
        letterId: letter3.id,
      },
    }),
  ]);
  console.log(`Created ${replies.length} sample replies`);

  // Create likes on letters
  await Promise.all([
    prisma.letterLike.create({ data: { userId: users[1].id, letterId: letter1.id } }),
    prisma.letterLike.create({ data: { userId: users[2].id, letterId: letter1.id } }),
    prisma.letterLike.create({ data: { userId: users[0].id, letterId: letter2.id } }),
    prisma.letterLike.create({ data: { userId: users[2].id, letterId: letter2.id } }),
    prisma.letterLike.create({ data: { userId: users[0].id, letterId: letter3.id } }),
    prisma.letterLike.create({ data: { userId: users[1].id, letterId: letter3.id } }),
    prisma.letterLike.create({ data: { userId: users[1].id, letterId: letter4.id } }),
    prisma.letterLike.create({ data: { userId: users[0].id, letterId: letter5.id } }),
    prisma.letterLike.create({ data: { userId: users[0].id, letterId: letter6.id } }),
    prisma.letterLike.create({ data: { userId: users[2].id, letterId: letter6.id } }),
  ]);
  console.log('Created 10 sample letter likes');

  // Create likes on replies
  await Promise.all([
    prisma.letterReplyLike.create({ data: { userId: users[0].id, replyId: replies[0].id } }),
    prisma.letterReplyLike.create({ data: { userId: users[2].id, replyId: replies[0].id } }),
    prisma.letterReplyLike.create({ data: { userId: users[0].id, replyId: replies[2].id } }),
    prisma.letterReplyLike.create({ data: { userId: users[1].id, replyId: replies[3].id } }),
  ]);
  console.log('Created 4 sample reply likes');

  // Create user settings for one user
  const settings = await prisma.userSettings.upsert({
    where: { userId: users[0].id },
    update: {},
    create: {
      userId: users[0].id,
      pushNotificationsEnabled: false,
      privacySettings: {
        create: {
          likesVisibility: 'PUBLIC',
        },
      },
    },
  });
  console.log(`Created user settings: ${settings.id}`);

  console.log('Seeding complete!');
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
