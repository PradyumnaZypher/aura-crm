import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
}

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <NavLink to={item.href}>
            {({ isActive }) => (
              <SidebarMenuButton
                isActive={isActive}
                className={cn(
                  "w-full transition-all duration-150",
                  isActive && "glow-violet"
                )}
                tooltip={item.label}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={cn(
                    "ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </SidebarMenuButton>
            )}
          </NavLink>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start justify-between mb-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  gradient,
}: {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  gradient?: string
}) {
  const isPositive = (change ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          gradient ?? "gradient-aura-subtle border border-primary/20"
        )}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {change !== undefined && (
          <p className={cn(
            "text-xs mt-1 font-medium",
            isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-destructive"
          )}>
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
            {changeLabel && <span className="text-muted-foreground font-normal ml-1">{changeLabel}</span>}
          </p>
        )}
      </div>
    </motion.div>
  )
}
