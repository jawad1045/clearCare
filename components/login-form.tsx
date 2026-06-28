"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { loginAction } from "@/action/auth/auth.model"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({ contactEmail: "", password: "" })

  React.useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setError("Your session has expired. Please log in again.")
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    if (error) setError(null)
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await loginAction({ email: formData.contactEmail, password: formData.password })

    if (!result || !result.success) {
      setIsLoading(false)
      setError(result?.error || "Something went wrong.")
      return
    }

    toast.success("Logged in successfully!")
    if (result.redirectTo) {
      router.push(result.redirectTo)
    } else {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 h-full overflow-none"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #0d6e72 0%, #073d42 45%, #030e12 100%)",
      }}
    >
      {/* Logo + title above card */}
      <div className="flex flex-col items-center w-md text-center bg-sidebar px-4 py-2 rounded-t-lg shadow-lg shadow-black/40">
        <div className="mb-4 rounded-full ring-2 ring-white/20 shadow-lg shadow-black/40">
          <Image
            src="/logo.png"
            alt="Logo"
            width={72}
            height={72}
            className="rounded-full object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-sidebar-foreground uppercase">
          HWP CLEAR-CARE™ PORTAL
        </h1>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-sidebar-accent-foreground uppercase">
          Secure Access &nbsp;·&nbsp; HIPAA Compliant
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md overflow-hidden rounded-b-lg shadow-2xl shadow-black/60">
        {/* Top accent bar */}
        <div className="h-0.75 bg-linear-to-r from-primary via-accent to-primary" />

        <div className="bg-white px-10 py-10">
          <div className="mb-6">
            <h2 className="text-[17px] font-semibold text-gray-900">Sign in to your account</h2>
            <p className="mt-0.5 text-sm text-gray-500">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="contactEmail"
                className="block text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Email Address
              </label>
              <input
                id="contactEmail"
                type="email"
                placeholder="your@email.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-gray-400">
            🔒 256-bit SSL &nbsp;·&nbsp; HIPAA Compliant
          </p>
        </div>
      </div>

      {/* Footer below card */}
      <p className="mt-6 text-center text-[11px] text-white/40">
        CLEAR-CARE® · Healthcare Coordination You Can Trust · HWP Enterprises, LLC
      </p>
    </div>
  )
}
