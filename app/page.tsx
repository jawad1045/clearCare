import { Suspense } from "react"
import LoginPage from "@/components/login-form"

export const home = () => {
  return (
    <Suspense>
      <LoginPage/>
    </Suspense>
  )
}

export default home
