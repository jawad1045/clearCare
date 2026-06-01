"use server"

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' 
import { PrismaPg } from '@prisma/adapter-pg';
import { cookies } from 'next/headers'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
    adapter,
})
// Inside /action/auth/auth.model.ts

export async function loginAction(formData: Record<string, string>) {
  try {
    const { email, password } = formData

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' }
    }

    const user = await prisma.user.findUnique({
      where: { contactEmail: email.toLowerCase() },
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' }
    }

    // Return the data and the destination route to the client smoothly
    const cookieStore = await cookies()
    cookieStore.set('session_token', `${user.id}_${user.userRole}`, {
      httpOnly: true, // Prevents client-side JS from reading it (Secure!)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day expiration
      path: '/',
    })
    return { 
      success: true, 
      redirectTo: user.userRole === "Admin" ? '/admin' : '/user',
      user: {
        email: user.contactEmail,
        role: user.userRole
      }
    }

  } catch (error) {
    console.error('Server Action Error [loginAction]:', error)
    return { success: false, error: 'An unexpected database error occurred.' }
  }
}