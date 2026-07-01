import { useState } from "react"
import { motion } from "framer-motion"
import {
  UserPlus, Search, MoreHorizontal, Shield, Users, User,
  CheckCircle2, XCircle, Clock, Mail, Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { mockUsers } from "@/lib/mock-data"

const roleColors = {
  ADMIN: "default",
  MANAGER: "secondary",
  CLIENT: "outline",
} as const

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-emerald-500", label: "Active" },
  inactive: { icon: XCircle, color: "text-muted-foreground", label: "Inactive" },
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
}

export default function AdminUsers() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "ALL" || u.role === roleFilter
    return matchSearch && matchRole
  })

  const roleCounts = {
    ALL: mockUsers.length,
    ADMIN: mockUsers.filter((u) => u.role === "ADMIN").length,
    MANAGER: mockUsers.filter((u) => u.role === "MANAGER").length,
    CLIENT: mockUsers.filter((u) => u.role === "CLIENT").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and access permissions</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Role filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { role: "ALL", label: "All Users", icon: Users },
          { role: "ADMIN", label: "Admins", icon: Shield },
          { role: "MANAGER", label: "Managers", icon: Users },
          { role: "CLIENT", label: "Clients", icon: User },
        ].map(({ role, label, icon: Icon }) => (
          <motion.button
            key={role}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRoleFilter(role)}
            className={`glass-card rounded-xl p-4 text-left transition-all ${
              roleFilter === role ? "ring-2 ring-primary glow-violet" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{roleCounts[role as keyof typeof roleCounts]}</span>
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </motion.button>
        ))}
      </div>

      {/* Table */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} users</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const statusInfo = statusConfig[user.status]
                return (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold gradient-aura text-white">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role]} className="text-xs">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5" />
                        {user.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <statusInfo.icon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                        <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-3.5 h-3.5 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            Deactivate User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
