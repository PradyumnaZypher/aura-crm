"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sparkles, LayoutDashboard, Users, BarChart3, Settings,
  Shield, LogOut, Bell, Search,
  Target, Phone, MessageSquare, Megaphone, HeadphonesIcon, FolderOpen,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"

const adminNavItems = [
  { label: "Command Center", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users & Roles", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "System", href: "/admin/system", icon: Settings },
]

const featureNavItems = [
  { label: "Leads Hub", href: "/leads", icon: Target, badge: 38 },
  { label: "AI Call Center", href: "/ai-calls", icon: Phone },
  { label: "Interactions", href: "/interactions", icon: MessageSquare },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Support", href: "/support", icon: HeadphonesIcon, badge: 12 },
  { label: "Documents", href: "/documents", icon: FolderOpen },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-aura flex items-center justify-center glow-violet flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold gradient-text leading-none">Aura CRM</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Admin Console</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="scrollbar-thin">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="mx-2 my-1" />

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
              Features
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {featureNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                              {item.badge}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="gradient-aura text-white text-xs font-bold">EV</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Elena Vasquez</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => router.push("/login")} className="flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex-1 flex items-center gap-3">
            <div className="relative hidden sm:flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search leads, users, campaigns..."
                className="h-8 w-64 pl-9 pr-3 text-sm bg-muted rounded-lg border-0 outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
            </Button>
            <ModeToggle />
            <Button variant="outline" size="sm" className="text-xs hidden sm:flex gap-1.5">
              <Shield className="w-3 h-3 text-primary" />
              Admin
            </Button>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6 overflow-auto"
        >
          {children}
        </motion.main>
      </SidebarInset>
    </SidebarProvider>
  )
}
