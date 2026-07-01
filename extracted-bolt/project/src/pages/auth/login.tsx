import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Shield, Users, BarChart3, Eye, EyeOff, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type Role = "ADMIN" | "MANAGER" | "CLIENT"

const roleRoutes: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  CLIENT: "/client/dashboard",
}

const demoCredentials: Record<Role, { email: string; password: string }> = {
  ADMIN: { email: "elena@auracrm.io", password: "admin123" },
  MANAGER: { email: "marcus@auracrm.io", password: "manager123" },
  CLIENT: { email: "jordan@client.com", password: "client123" },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>("ADMIN")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDemoLogin = () => {
    setLoading(true)
    const creds = demoCredentials[role]
    setEmail(creds.email)
    setPassword(creds.password)
    setTimeout(() => {
      navigate(roleRoutes[role])
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      navigate(roleRoutes[role])
    }, 600)
  }

  return (
    <div className="min-h-screen flex bg-background mesh-bg overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 gradient-aura opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.55 0.28 270)" }} />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.65 0.2 200)" }} />

        {/* Logo */}
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

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-4">
              The AI-Powered CRM<br />
              <span className="gradient-text">Built for Growth</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Intelligent lead management, AI voice analytics, and automated outreach — all in one beautiful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Zap, title: "AI Voice Analytics", desc: "Real-time sentiment analysis on every call" },
              { icon: BarChart3, title: "Smart Pipeline", desc: "Predictive scoring and conversion insights" },
              { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4 glass-card rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-lg gradient-aura-subtle border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground relative z-10"
        >
          © 2026 Aura CRM. All rights reserved.
        </motion.p>
      </div>

      {/* Right panel - Login form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl gradient-aura flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Aura CRM</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your workspace</p>
          </div>

          {/* Role tabs */}
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={demoCredentials[r].email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <button type="button" className="text-sm text-primary hover:underline">Forgot password?</button>
                  </div>

                  <Button type="submit" className="w-full h-11 gradient-aura text-white border-0 glow-violet" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-3 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2"
                    onClick={handleDemoLogin}
                    disabled={loading}
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    Demo Login as {r.charAt(0) + r.slice(1).toLowerCase()}
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Get started free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
