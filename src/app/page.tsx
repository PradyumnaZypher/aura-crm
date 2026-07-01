"use client"

import { motion } from "framer-motion"
import {
  Shield, Users, User, ArrowRight, Sparkles, CheckCircle2,
  Lock, Zap, Star, LayoutDashboard, Database, Activity
} from "lucide-react"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function Home() {
  return (
    <div className="relative min-h-screen mesh-bg overflow-x-hidden text-foreground selection:bg-primary/20">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-chart-2/10 blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-20 border-b border-border/40 backdrop-blur-md bg-background/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl gradient-aura flex items-center justify-center shadow-glow">
              <Zap className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary">
              Aura CRM
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium gradient-aura text-white px-4 py-2 rounded-xl hover:shadow-glow transition-all duration-300">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary animate-pulse-glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven CRM Platform
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-foreground"
          >
            Manage Your Sales Flow with{" "}
            <span className="gradient-text">Aura AI CRM</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Automate voice call outreach, track pipeline conversions, and build lasting customer relationships with our premium glassmorphic agent command desk.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <button className="flex items-center gap-2 font-medium gradient-aura text-white px-6 py-3 rounded-xl hover:shadow-glow transition-all duration-300 transform hover:-translate-y-0.5">
                Launch System Desk
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/signup" className="px-6 py-3 rounded-xl border border-border bg-card/40 backdrop-blur hover:bg-card/80 transition-colors text-sm font-medium">
              Create Agent Account
            </Link>
          </motion.div>
        </motion.div>

        {/* Roles/Workspace Router Grid */}
        <section className="w-full max-w-6xl mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Aura Workspaces</h2>
            <p className="text-sm text-muted-foreground mt-1">Select your designated command center</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Desk */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 text-left relative flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Admin Command Desk</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  System settings, user directories, global pipeline charts, security audits, and database backups.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Unified role directory",
                    "Real-time resource logs",
                    "Database restore & seed",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/admin/dashboard" className="mt-6 flex items-center justify-between text-xs font-semibold text-violet-500 group-hover:underline">
                Enter Admin Hub
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Manager Desk */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 text-left relative flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Manager Pipeline</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Lead pipeline tracker, automated AI campaign launchers, call scripts, and agent activities.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Visual lead Kanban boards",
                    "AI outbound campaign builder",
                    "Weekly transcript reports",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/manager/dashboard" className="mt-6 flex items-center justify-between text-xs font-semibold text-cyan-500 group-hover:underline">
                Enter Manager Hub
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Client Portal */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 text-left relative flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Client Workspace</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Assigned files, ticket manager, action check-ins, interaction logs, and meeting bookings.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Assigned contract manager",
                    "Direct ticketing desk",
                    "Upcoming sessions calendar",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/client/dashboard" className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-500 group-hover:underline">
                Enter Client Hub
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/10 backdrop-blur-sm text-center text-xs text-muted-foreground">
        <p>© 2026 Aura CRM Systems · Engineered with Next.js, Radix & Framer Motion</p>
      </footer>
    </div>
  )
}