import { Outlet, NavLink, useNavigate } from "react-router-dom"
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
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"

const clientNav = [
  { label: "My Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/client/analytics", icon: BarChart3 },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Support", href: "/support", icon: HeadphonesIcon, badge: 1 },
]

export default function ClientLayout() {
  const navigate = useNavigate()

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
                {clientNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <NavLink to={item.href}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
                              {item.badge}
                            </span>
                          )}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
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
            <Button variant="ghost" size="icon-sm" onClick={() => navigate("/login")} className="flex-shrink-0">
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
            <Badge variant="outline" className="text-xs hidden sm:flex">
              <User className="w-3 h-3 mr-1 text-emerald-500" />Client
            </Badge>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6 overflow-auto"
        >
          <Outlet />
        </motion.main>
      </SidebarInset>
    </SidebarProvider>
  )
}
