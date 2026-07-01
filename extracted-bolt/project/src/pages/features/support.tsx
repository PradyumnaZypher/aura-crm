import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus, Search, AlertCircle, CheckCircle2, Clock, MessageSquare,
  Send, Lock, Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockTickets } from "@/lib/mock-data"
import type { SupportTicket } from "@/lib/mock-data"

const statusConfig: Record<SupportTicket["status"], { label: string; className: string; icon: React.ElementType }> = {
  OPEN:        { label: "Open",        className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",       icon: Clock },
  IN_PROGRESS: { label: "In Progress", className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20", icon: AlertCircle },
  RESOLVED:    { label: "Resolved",    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  CLOSED:      { label: "Closed",      className: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
}

const priorityConfig: Record<SupportTicket["priority"], { dot: string; label: string }> = {
  LOW:    { dot: "bg-muted-foreground", label: "Low" },
  MEDIUM: { dot: "bg-amber-500",        label: "Medium" },
  HIGH:   { dot: "bg-orange-500",       label: "High" },
  URGENT: { dot: "bg-red-500",          label: "Urgent" },
}

const categoryLabel: Record<SupportTicket["category"], string> = {
  TECHNICAL:       "Technical",
  BILLING:         "Billing",
  FEATURE_REQUEST: "Feature Request",
  BUG_REPORT:      "Bug Report",
  GENERAL:         "General",
}

function TicketCard({ ticket, index, isSelected, onSelect }: {
  ticket: SupportTicket
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const sc = statusConfig[ticket.status]
  const pc = priorityConfig[ticket.priority]

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? "border-primary/50 bg-primary/5 glow-violet"
          : "border-border/50 glass-card hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{ticket.title}</p>
        <Badge className={`text-[10px] border flex-shrink-0 ${sc.className}`}>{sc.label}</Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{ticket.description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
          <span className="text-[10px] text-muted-foreground">{pc.label}</span>
        </div>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {categoryLabel[ticket.category]}
        </Badge>
        {ticket.replies.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{ticket.replies.length}</span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground/60 mt-2">{ticket.createdAt}</p>
    </motion.button>
  )
}

function TicketDetail({ ticket }: { ticket: SupportTicket }) {
  const [replyText, setReplyText] = useState("")
  const sc = statusConfig[ticket.status]
  const pc = priorityConfig[ticket.priority]
  const StatusIcon = sc.icon

  return (
    <div className="flex flex-col h-full">
      {/* Ticket header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h2 className="font-semibold text-foreground leading-tight">{ticket.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              #{ticket.id.toUpperCase()} · Created by <span className="text-foreground">{ticket.createdBy}</span> · {ticket.createdAt}
            </p>
          </div>
          <Badge className={`text-xs border flex-shrink-0 gap-1 ${sc.className}`}>
            <StatusIcon className="w-3 h-3" />
            {sc.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
            <span className="text-xs text-muted-foreground">{pc.label} Priority</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {categoryLabel[ticket.category]}
          </Badge>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1.5">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[8px] gradient-aura text-white">
                  {ticket.assignedTo.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{ticket.assignedTo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Original description */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="text-xs gradient-aura text-white font-bold">
              {ticket.createdBy.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold text-foreground">{ticket.createdBy}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto">
        {ticket.replies.map((reply) => (
          <div
            key={reply.id}
            className={`p-5 border-b border-border ${reply.isInternal ? "bg-amber-500/3" : ""}`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs gradient-aura text-white font-bold">
                  {reply.author.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{reply.author}</span>
                  <span className="text-xs text-muted-foreground">{reply.date}</span>
                  {reply.isInternal && (
                    <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/30 text-amber-500">
                      <Lock className="w-2.5 h-2.5" />
                      Internal
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
              </div>
            </div>
          </div>
        ))}
        {ticket.replies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No replies yet.</p>
          </div>
        )}
      </div>

      {/* Reply box */}
      <div className="p-4 border-t border-border">
        <Textarea
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={3}
          className="mb-3 resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Internal Note
          </Button>
          <Button
            size="sm"
            className="gradient-aura text-white border-0 gap-1.5 text-xs"
            disabled={!replyText.trim()}
          >
            <Send className="w-3.5 h-3.5" />
            Send Reply
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SupportPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket>(mockTickets[0])

  const filtered = mockTickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = {
    ALL: mockTickets.length,
    OPEN: mockTickets.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: mockTickets.filter((t) => t.status === "IN_PROGRESS").length,
    RESOLVED: mockTickets.filter((t) => t.status === "RESOLVED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{statusCounts.OPEN} open · {statusCounts.IN_PROGRESS} in progress</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </motion.div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-[600px]">
        {/* Left: ticket list */}
        <div className="space-y-3">
          {/* Search & filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? `All (${statusCounts.ALL})` :
                     s === "OPEN" ? `Open (${statusCounts.OPEN})` :
                     s === "IN_PROGRESS" ? "In Progress" :
                     s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket list */}
          <div className="space-y-2">
            {filtered.map((ticket, i) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                index={i}
                isSelected={selectedTicket.id === ticket.id}
                onSelect={() => setSelectedTicket(ticket)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No tickets found.</p>
            )}
          </div>
        </div>

        {/* Right: ticket detail */}
        <Card className="glass-card border-0 overflow-hidden">
          <TicketDetail ticket={selectedTicket} />
        </Card>
      </div>
    </div>
  )
}
