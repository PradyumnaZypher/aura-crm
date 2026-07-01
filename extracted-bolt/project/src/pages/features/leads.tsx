import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus, Search, Filter, MoreHorizontal, UserPlus,
  ArrowUpRight, Phone, Mail, Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { mockLeads, mockUsers } from "@/lib/mock-data"
import type { Lead } from "@/lib/mock-data"

const statusConfig: Record<Lead["status"], { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  CONTACTED: { label: "Contacted", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  QUALIFIED: { label: "Qualified", className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  PROPOSAL: { label: "Proposal", className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
  NEGOTIATION: { label: "Negotiation", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  CLOSED_WON: { label: "Closed Won", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CLOSED_LOST: { label: "Closed Lost", className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
}

const priorityConfig: Record<Lead["priority"], { dot: string; label: string }> = {
  LOW: { dot: "bg-muted-foreground", label: "Low" },
  MEDIUM: { dot: "bg-amber-500", label: "Medium" },
  HIGH: { dot: "bg-orange-500", label: "High" },
  URGENT: { dot: "bg-red-500", label: "Urgent" },
}

export default function LeadsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [assignDialog, setAssignDialog] = useState<Lead | null>(null)
  const [selectedUser, setSelectedUser] = useState("")

  const managers = mockUsers.filter((u) => u.role === "MANAGER")

  const filtered = mockLeads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = Object.fromEntries(
    (["ALL", "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"] as const).map(
      (s) => [s, s === "ALL" ? mockLeads.length : mockLeads.filter((l) => l.status === s).length]
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockLeads.length} total leads · {mockLeads.filter((l) => l.status === "CLOSED_WON").length} closed won</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </motion.div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
              statusFilter === s
                ? "gradient-aura text-white border-transparent glow-violet"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {s.replace("_", " ")}
            <span className="ml-1.5 opacity-70">({statusCounts[s]})</span>
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <span className="text-sm text-muted-foreground">{filtered.length} results</span>
      </div>

      {/* Leads table */}
      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Value</TableHead>
                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                <TableHead className="hidden xl:table-cell">Source</TableHead>
                <TableHead className="hidden xl:table-cell">Last Activity</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead, i) => {
                const sc = statusConfig[lead.status]
                const pc = priorityConfig[lead.priority]
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold gradient-aura text-white">
                            {lead.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {lead.company}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${sc.className}`}>{sc.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
                        <span className="text-xs text-muted-foreground">{pc.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm font-semibold text-foreground">${(lead.value / 1000).toFixed(0)}K</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px] font-bold gradient-aura text-white">
                              {lead.assignedTo.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{lead.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                      {lead.lastActivity}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ArrowUpRight className="w-3.5 h-3.5 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="w-3.5 h-3.5 mr-2" />
                            Start AI Call
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-3.5 h-3.5 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAssignDialog(lead)}>
                            <UserPlus className="w-3.5 h-3.5 mr-2" />
                            Assign To
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">Delete Lead</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
            <DialogDescription>
              Assign <span className="font-semibold text-foreground">{assignDialog?.name}</span> to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team member..." />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[10px] gradient-aura text-white">{m.initials}</AvatarFallback>
                      </Avatar>
                      {m.name} · {m.department}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button
              className="gradient-aura text-white border-0"
              disabled={!selectedUser}
              onClick={() => setAssignDialog(null)}
            >
              Assign Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
