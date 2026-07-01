import { motion } from "framer-motion"
import {
  Target, Phone, FileText, HeadphonesIcon, Calendar,
  CheckCircle2, Clock, ArrowUpRight, Sparkles, TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { clientStats, clientCalendarEvents, mockLeads } from "@/lib/mock-data"

const calendarTypeColors: Record<string, string> = {
  call: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  meeting: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  demo: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
}

export default function ClientDashboard() {
  const myLeads = mockLeads.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card rounded-2xl p-6 overflow-hidden"
      >
        <div className="absolute inset-0 gradient-aura opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs text-primary font-medium">AI Assistant Active</p>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, Jordan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your next AI call is <span className="text-foreground font-medium">{clientStats.nextCallDate}</span>
            </p>
          </div>
          <Button className="gradient-aura text-white border-0 gap-2 hidden sm:flex">
            <Phone className="w-4 h-4" />
            Join Call
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Leads", value: clientStats.activeLeads, icon: Target, color: "text-chart-1" },
          { label: "Scheduled Calls", value: clientStats.scheduledCalls, icon: Phone, color: "text-chart-2" },
          { label: "Open Tickets", value: clientStats.openTickets, icon: HeadphonesIcon, color: "text-chart-5" },
          { label: "Contract Value", value: `$${(clientStats.contractValue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-chart-3" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4"
          >
            <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">My Assigned Leads</CardTitle>
                <a href="/leads" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {myLeads.map((lead) => (
                <div key={lead.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company}</p>
                    </div>
                    <Badge
                      className={`text-xs border-0 ${
                        lead.status === "NEGOTIATION" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" :
                        lead.status === "PROPOSAL" ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" :
                        lead.status === "QUALIFIED" ? "bg-violet-500/15 text-violet-600 dark:text-violet-400" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">${(lead.value / 1000).toFixed(0)}K</span>
                    </div>
                    <Progress
                      value={
                        lead.status === "CLOSED_WON" ? 100 :
                        lead.status === "NEGOTIATION" ? 80 :
                        lead.status === "PROPOSAL" ? 60 :
                        lead.status === "QUALIFIED" ? 40 :
                        lead.status === "CONTACTED" ? 20 : 10
                      }
                      className="h-1.5"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {lead.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientCalendarEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-background/40 rounded-lg border border-border/50">
                  <div className="flex-shrink-0 text-center min-w-[36px]">
                    <p className="text-xs text-muted-foreground">{event.date.split("-")[2]}</p>
                    <p className="text-xs font-bold text-primary">
                      {new Date(event.date).toLocaleString("default", { month: "short" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
                    <p className="text-[10px] text-muted-foreground">{event.time}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{event.lead}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${calendarTypeColors[event.type] ?? "bg-muted text-muted-foreground"}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="glass-card border-0 mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: CheckCircle2, color: "text-emerald-500", text: "Proposal sent for NovaTech", time: "2h ago" },
                { icon: Phone, color: "text-primary", text: "AI call completed – 12m34s", time: "5h ago" },
                { icon: FileText, color: "text-cyan-500", text: "Contract draft uploaded", time: "1d ago" },
                { icon: Clock, color: "text-amber-500", text: "Follow-up scheduled", time: "2d ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{item.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">{item.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
