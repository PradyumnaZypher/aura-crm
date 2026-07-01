"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Shield, Users, BarChart3, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Role = "ADMIN" | "MANAGER" | "CLIENT"

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("CLIENT")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [company, setCompany] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Split name into first and last
    const nameParts = name.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || "User"

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          company,
          agreeToTerms: true,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      const redirectPath = `/${data.user.role.toLowerCase()}/dashboard`
      router.push(redirectPath)
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
      setLoading(false)
    }
  }

  const perks = [
    "14-day free trial, no credit card required",
    "AI voice analytics from day one",
    "Unlimited leads & contacts",
    "Cancel anytime",
  ]

  return (
    <div className="min-h-screen flex bg-background mesh-bg overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 overflow-hidden">
        <div className="absolute inset-0 gradient-aura opacity-10 pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.55 0.28 270)" }} />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-10 h-10 rounded-xl gradient-aura flex items-center justify-center glow-violet">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Aura CRM</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-foreground mb-4">
              Start your journey<br />
              <span className="gradient-text">with Aura AI</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Join 2,400+ sales teams already using Aura CRM to close more deals with less effort.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{perk}</span>
              </motion.div>
            ))}
          </div>

          {/* Stat bar */}
          <div className="glass-card rounded-2xl p-6 grid grid-cols-3 gap-4">
            {[
              { val: "2.4K+", label: "Teams" },
              { val: "98%", label: "Satisfaction" },
              { val: "3.2x", label: "Avg ROI" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.val}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground relative z-10"
        >
          © 2026 Aura CRM. All rights reserved.
        </motion.p>
      </div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl gradient-aura flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Aura CRM</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">Create account</h2>
            <p className="text-muted-foreground mt-1">Start your 14-day free trial</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="ADMIN" className="gap-1.5">
                <Shield className="w-3.5 h-3.5" />Admin
              </TabsTrigger>
              <TabsTrigger value="MANAGER" className="gap-1.5">
                <Users className="w-3.5 h-3.5" />Manager
              </TabsTrigger>
              <TabsTrigger value="CLIENT" className="gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />Client
              </TabsTrigger>
            </TabsList>

            {(["ADMIN", "MANAGER", "CLIENT"] as Role[]).map((r) => (
              <TabsContent key={r} value={r} className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Elena Vasquez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>

                  <Button type="submit" className="w-full h-11 gradient-aura text-white border-0 glow-violet" disabled={loading}>
                    {loading ? "Creating account..." : `Create ${r.charAt(0) + r.slice(1).toLowerCase()} Account`}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}