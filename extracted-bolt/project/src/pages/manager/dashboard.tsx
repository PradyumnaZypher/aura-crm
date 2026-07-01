import { motion } from "framer-motion"
import { Users, Target, TrendingUp, Phone, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts"
import {
  managerStats, mockLeads, mockCallRecords, aiCallVolumeData, sentimentData,
} from "@/lib/mock-data"

const callVolumeConfig = {
  calls: { label: "Calls", color: "var(--chart-1)" },
}
const sentimentConfig = {
  positive: { label: "Positive", color: "var(--chart-3)" },
  neutral: { label: "Neutral", color: "var(--chart-4)" },
  negative: { label: "Negative", color: "var(--chart-5)" },
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  CONTACTED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  QUALIFIED: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  PROPOSAL: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  NEGOTIATION: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  CLOSED_WON: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  CLOSED_LOST: "bg-red-500/15 text-red-600 dark:text-red-400",
}

const priorityColors: Record<string, string> = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-amber-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
}

// Kanban columns
const kanbanColumns = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]

export default function ManagerDashboard() {
  const kanbanLeads = kanbanColumns.map((stage) => ({
    stage,
    leads: mockLeads.filter((l) => l.status === stage),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Sales pipeline & team performance</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2 hidden sm:flex">
          <Phone className="w-4 h-4" />
          Start AI Call
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Team Size", value: managerStats.teamMembers, icon: Users },
          { label: "Active Leads", value: managerStats.activeLeads, icon: Target },
          { label: "Pipeline", value: `$${(managerStats.pipelineValue / 1000000).toFixed(1)}M`, icon: TrendingUp },
          { label: "Weekly Calls", value: managerStats.weeklyCallsMade, icon: Phone },
          { label: "Conversion", value: `${managerStats.conversionRate}%`, icon: TrendingUp },
          { label: "Avg Deal", value: `$${(managerStats.avgDealSize / 1000).toFixed(0)}K`, icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4"
          >
            <stat.icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">AI Call Volume (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={callVolumeConfig} className="h-[200px] w-full">
                <BarChart data={aiCallVolumeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="manBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="calls" fill="url(#manBarGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Sentiment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sentimentConfig} className="h-[200px] w-full">
                <LineChart data={sentimentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="positive" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="neutral" stroke="var(--chart-4)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="negative" stroke="var(--chart-5)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Kanban pipeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Lead Pipeline</h2>
          <a href="/leads" className="text-xs text-primary hover:underline flex items-center gap-1">
            Full view <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
          {kanbanLeads.map(({ stage, leads }) => (
            <div key={stage} className="glass-card rounded-xl p-3 min-w-[160px]">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[stage] ?? "bg-muted text-muted-foreground"}`}>
                  {stage.replace("_", " ")}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{leads.length}</span>
              </div>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-background/50 rounded-lg p-2.5 border border-border/50">
                    <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{lead.company}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-semibold text-primary">${(lead.value / 1000).toFixed(0)}K</span>
                      <span className={`text-[10px] font-medium ${priorityColors[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent AI Calls */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent AI Call Logs</CardTitle>
              <a href="/ai-calls" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCallRecords.slice(0, 4).map((call) => (
                <div key={call.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs gradient-aura text-white font-bold">
                      {call.leadName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{call.leadName}</p>
                    <p className="text-xs text-muted-foreground truncate">{call.summary.slice(0, 60)}…</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        call.sentiment === "positive" ? "border-emerald-500/30 text-emerald-500" :
                        call.sentiment === "negative" ? "border-destructive/30 text-destructive" :
                        "border-amber-500/30 text-amber-500"
                      }`}
                    >
                      {call.sentimentScore}% {call.sentiment}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{call.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
