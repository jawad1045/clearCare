"use server"

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // Recommen
import { PrismaPg } from '@prisma/adapter-pg';

const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL,
})
// If you are hardcoding your database connection string, pass it inside the object below:
const prisma = new PrismaClient({
    adapter,
})

export async function loginAction(formData: Record<string, string>) {
  try {
    const { email, password } = formData

    // 1. Core validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' }
    }

    // 2. Query your PostgreSQL database using the exact field from your schema: 'contactEmail'
    // Depending on your Prisma setup, if it complains about 'user', use 'prisma.user' or 'prisma.tbl_Users'
    const user = await prisma.user.findUnique({
      where: { 
        contactEmail: email.toLowerCase() 
      },
    })

    // 3. Keep error messages generic for system security
    if (!user) {
      return { success: false, error: 'Invalid email or password.' }
    }

    // 4. Verify hashed credential matches
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' }
    }

    // 5. Build safe session return data (stripping the password out)
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    }

  } catch (error) {
    console.error('Server Action Error [loginAction]:', error)
    return { success: false, error: 'An unexpected database error occurred.' }
  }
}