import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const db = new PrismaClient()
const email = (process.env.ADMIN_EMAIL || 'admin@ems.local').toLowerCase()
const pw = process.env.ADMIN_PASSWORD || 'admin1234'
await db.user.upsert({ where: { email }, update: {}, create: { email, name: 'Admin', role: 'admin', perms: [], passwordHash: await bcrypt.hash(pw, 10) } })
console.log('Admin prêt :', email, '/', pw, '(change le mot de passe)')
await db.$disconnect()
