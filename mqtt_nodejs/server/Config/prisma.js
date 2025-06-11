// const { PrismaClient } = require('../generated/prisma')
// const prisma = new PrismaClient()

// module.exports = prisma


const { PrismaClient } = require('../generated/prisma');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

console.log('Create PrismaClient')
module.exports = prisma;