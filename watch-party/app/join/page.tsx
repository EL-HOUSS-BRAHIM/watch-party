import { RegisterForm } from "@/components/auth/register-form"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Join the party</h2>
            <p className="mt-2 text-muted-foreground">Create your account and start watching with friends</p>
          </div>

          <RegisterForm />

          <div className="text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
