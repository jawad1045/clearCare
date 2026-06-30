import { Suspense } from "react"
import type { Metadata } from "next"
import LoginPage from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login",
}

export const home = () => {
  return (
    <Suspense>
      <LoginPage/>
    </Suspense>
  )
}

export default home
