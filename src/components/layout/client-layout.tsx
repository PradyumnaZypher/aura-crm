"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sparkles, LayoutDashboard, BarChart3,
  FileText, HeadphonesIcon, LogOut, Bell, User,
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

const clientNav = [
  { label: "My Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/client/analytics", icon: BarChart3 },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Support", href: "/support", icon: HeadphonesIcon, badge: 1 },
]

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-aura flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold gradient-text leading-none">Aura CRM</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Client Portal</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="scrollbar-thin">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
              Portal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clientNav.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
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
              <AvatarFallback className="bg-emerald-500/20 text-emerald-600 text-xs font-bold">JL</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Jordan Lee</p>
              <p className="text-xs text-muted-foreground truncate">Acme Corp</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => router.push("/login")} className="flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="w-4 h-4" />
            </Button>
            <ModeToggle />
            <Button variant="outline" size="sm" className="text-xs hidden sm:flex gap-1.5">
              <User className="w-3 h-3 text-emerald-500" />
              Client
            </Button>
          </div>
        </header>

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
