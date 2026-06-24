"use server"

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs'
import { setSessionCookie, clearSession } from '@/lib/auth';
import { getSessionTimeoutMinutes } from '@/action/settings.action';
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

    const timeoutMinutes = await getSessionTimeoutMinutes();
    await setSessionCookie({ id: user.id, role: user.userRole }, timeoutMinutes)

    return {
      success: true,
      redirectTo: user.userRole === 'Admin' ? '/admin' : '/user',
      user: {
        email: user.contactEmail,
        role: user.userRole,
      },
    }

  } catch (error) {
    console.error('Server Action Error [loginAction]:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected server error occurred.',
    }
  }
}

export async function logoutAction() {
  await clearSession()
  return {
    success: true,
  }
}
