"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Zap } from "lucide-react"
import { loginAction } from "@/action/auth/auth.model"
import { appConfig } from "@/next.config"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const appName = appConfig.name
  const appSlogan = appConfig.slogan
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState({ contactEmail: "", password: "" })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    if (error) setError(null)
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await loginAction({
      email: formData.contactEmail,
      password: formData.password
    })

    if (!result || !result.success) {
      setIsLoading(false)
      setError(result?.error || 'Something went wrong.')
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
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 flex-col justify-between p-12">
        <div>
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="p-2 bg-linear-to-br from-cyan-400 to-blue-500 rounded-lg">
              <Zap className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-2xl font-bold text-white">{appName}</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              {appSlogan}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Manage, track, and optimize your referral program with a modern, intelligent platform built for growth.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg mt-1">
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Fast & Efficient</p>
                <p className="text-sm text-slate-400">Manage referrals in seconds, not hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-400/10 rounded-lg mt-1">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Real-time Analytics</p>
                <p className="text-sm text-slate-400">Track performance with live insights</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-400/10 rounded-lg mt-1">
                <Zap className="h-4 w-4 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Secure & Reliable</p>
                <p className="text-sm text-slate-400">Enterprise-grade security for your data</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500">© 2026 RefHub. All rights reserved.</p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 bg-linear-to-br from-cyan-400 to-blue-500 rounded-lg">
                <Zap className="h-6 w-6 text-slate-950" />
              </div>
              <span className="text-2xl font-bold text-foreground">{appName}</span>
            </div>
            <p className="text-sm text-muted-foreground">{appSlogan}</p>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-4 text-sm font-medium text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="contactEmail" 
                type="email"
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={formData.contactEmail} 
                onChange={handleInputChange}
                required
                className="h-11 border-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:focus:border-cyan-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11 pr-10 border-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  )
}