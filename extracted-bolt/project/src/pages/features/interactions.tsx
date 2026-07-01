import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import {
  Phone, Mail, MessageSquare, Users, FileText,
  Search, Filter, Plus, ChevronRight,
  TrendingUp, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockInteractions } from "@/lib/mock-data"
import type { Interaction } from "@/lib/mock-data"

const typeConfig: Record<Interaction["type"], { icon: React.ElementType; className: string; label: string }> = {
  CALL:    { icon: Phone,         className: "bg-violet-500/15 text-violet-600 dark:text-violet-400", label: "Call" },
  EMAIL:   { icon: Mail,          className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",       label: "Email" },
  SMS:     { icon: MessageSquare, className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",    label: "SMS" },
  MEETING: { icon: Users,         className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "Meeting" },
  NOTE:    { icon: FileText,      className: "bg-orange-500/15 text-orange-600 dark:text-orange-400", label: "Note" },
}

const sentimentDot: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral:  "bg-amber-500",
  negative: "bg-red-500",
}

function InteractionCard({ interaction, index }: { interaction: Interaction; index: number }) {
  const tc = typeConfig[interaction.type]
  const Icon = tc.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-4 p-4 glass-card rounded-xl hover:bg-muted/10 transition-colors cursor-pointer group"
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${tc.className}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{interaction.subject}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{interaction.leadName}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-muted-foreground transition-colors mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{interaction.summary}</p>
        <div className="flex items-center gap-3 mt-2">
          <Badge className={`text-[10px] border-0 ${tc.className}`}>{tc.label}</Badge>
          {interaction.sentiment && (
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${sentimentDot[interaction.sentiment]}`} />
              <span className="text-[10px] text-muted-foreground capitalize">{interaction.sentiment}</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">{interaction.date}</span>
        </div>
      </div>
    </motion.div>
  )
}

function InteractionStats() {
  const counts = Object.entries(typeConfig).map(([type, cfg]) => ({
    type,
    label: cfg.label,
    className: cfg.className,
    count: mockInteractions.filter((i) => i.type === type).length,
  }))
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {counts.map((c, i) => (
        <motion.div
          key={c.type}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass-card rounded-xl p-3 text-center"
        >
          <p className="text-xl font-bold text-foreground">{c.count}</p>
          <p className={`text-[10px] font-medium mt-0.5 inline-block px-2 py-0.5 rounded-full ${c.className}`}>
            {c.label}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

function InteractionTimeline({ interactions }: { interactions: Interaction[] }) {
  return (
    <div className="relative space-y-0">
      <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border/60" />
      {interactions.map((interaction, index) => {
        const tc = typeConfig[interaction.type]
        const Icon = tc.icon
        return (
          <motion.div
            key={interaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-4 pb-5 last:pb-0"
          >
            <div className={`relative z-10 flex-shrink-0 w-[45px] h-[45px] rounded-xl flex items-center justify-center ${tc.className}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{interaction.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {interaction.date}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[10px] font-bold gradient-aura text-white">
                      {interaction.assignedTo.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{interaction.assignedTo.split(" ")[0]}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{interaction.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-[10px] border-0 ${tc.className}`}>{tc.label}</Badge>
                <span className="text-xs text-muted-foreground">{interaction.leadName}</span>
                {interaction.sentiment && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className={`w-1.5 h-1.5 rounded-full ${sentimentDot[interaction.sentiment]}`} />
                    <span className="text-[10px] text-muted-foreground capitalize">{interaction.sentiment}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function InteractionsContent() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [view, setView] = useState<"cards" | "timeline">("cards")

  const filtered = mockInteractions.filter((i) => {
    const matchSearch =
      i.leadName.toLowerCase().includes(search.toLowerCase()) ||
      i.subject.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "ALL" || i.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interactions Center</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockInteractions.length} total interactions across all leads</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          Log Interaction
        </Button>
      </motion.div>

      <InteractionStats />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search interactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {(["CALL", "EMAIL", "SMS", "MEETING", "NOTE"] as const).map((t) => (
              <SelectItem key={t} value={t}>{typeConfig[t].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 ml-auto">
          {(["cards", "timeline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all capitalize ${
                view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} results</span>
      </div>

      {/* Content */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {view === "timeline" ? "Activity Timeline" : "Recent Interactions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No interactions found.</p>
          ) : view === "timeline" ? (
            <InteractionTimeline interactions={filtered} />
          ) : (
            <div className="space-y-3">
              {filtered.map((interaction, i) => (
                <InteractionCard key={interaction.id} interaction={interaction} index={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function InteractionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <InteractionsContent />
    </Suspense>
  )
}
