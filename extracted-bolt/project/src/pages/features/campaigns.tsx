import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus, Play, Pause, BarChart3, Target, Users,
  TrendingUp, Edit3, Copy, Trash2, Zap,
  ChevronDown, ChevronUp, CheckCircle2, Clock, FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockCampaigns } from "@/lib/mock-data"
import type { Campaign } from "@/lib/mock-data"

const statusConfig: Record<Campaign["status"], { label: string; className: string; dot: string }> = {
  ACTIVE:    { label: "Active",    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" },
  DRAFT:     { label: "Draft",     className: "bg-muted text-muted-foreground border-border",                                   dot: "bg-muted-foreground" },
  PAUSED:    { label: "Paused",    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",         dot: "bg-amber-500" },
  COMPLETED: { label: "Completed", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",             dot: "bg-blue-500" },
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const sc = statusConfig[campaign.status]
  const contactedPct = campaign.leadsTargeted > 0
    ? Math.round((campaign.leadsContacted / campaign.leadsTargeted) * 100)
    : 0

  let criteria: Record<string, unknown> = {}
  try { criteria = JSON.parse(campaign.targetCriteria) } catch {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot} ${campaign.status === "ACTIVE" ? "animate-pulse" : ""}`} />
              <Badge className={`text-xs border ${sc.className}`}>{sc.label}</Badge>
            </div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">{campaign.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Created {campaign.createdAt}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Edit3 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {campaign.status === "ACTIVE" ? (
                <DropdownMenuItem>
                  <Pause className="w-3.5 h-3.5 mr-2" /> Pause
                </DropdownMenuItem>
              ) : campaign.status === "PAUSED" ? (
                <DropdownMenuItem>
                  <Play className="w-3.5 h-3.5 mr-2" /> Resume
                </DropdownMenuItem>
              ) : campaign.status === "DRAFT" ? (
                <DropdownMenuItem>
                  <Play className="w-3.5 h-3.5 mr-2" /> Launch
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metrics grid */}
        {campaign.status !== "DRAFT" ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Response Rate", value: `${campaign.responseRate}%`, icon: TrendingUp, color: "text-chart-1" },
              { label: "Conversion",    value: `${campaign.conversionRate}%`, icon: CheckCircle2, color: "text-chart-3" },
              { label: "Targeted",      value: campaign.leadsTargeted, icon: Target, color: "text-chart-2" },
              { label: "Contacted",     value: campaign.leadsContacted, icon: Users, color: "text-chart-4" },
            ].map((m) => (
              <div key={m.label} className="bg-background/40 rounded-lg p-2.5 border border-border/40">
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon className={`w-3 h-3 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-4">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Campaign is in draft mode. Configure and launch to start outreach.</p>
          </div>
        )}

        {/* Progress bar */}
        {campaign.leadsTargeted > 0 && (
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Outreach Progress</span>
              <span className="font-medium text-foreground">{contactedPct}%</span>
            </div>
            <Progress value={contactedPct} className="h-2" />
          </div>
        )}

        {/* Action button */}
        {campaign.status === "DRAFT" ? (
          <Button size="sm" className="w-full gradient-aura text-white border-0 gap-2 text-xs">
            <Zap className="w-3.5 h-3.5" />
            Launch Campaign
          </Button>
        ) : campaign.status === "ACTIVE" ? (
          <Button size="sm" variant="outline" className="w-full gap-2 text-xs">
            <Pause className="w-3.5 h-3.5" />
            Pause Campaign
          </Button>
        ) : campaign.status === "PAUSED" ? (
          <Button size="sm" className="w-full gradient-aura text-white border-0 gap-2 text-xs">
            <Play className="w-3.5 h-3.5" />
            Resume Campaign
          </Button>
        ) : null}
      </div>

      <Separator />

      {/* Script + criteria expander */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" />
          Script & Target Criteria
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 space-y-4"
        >
          <div>
            <p className="text-xs font-medium text-foreground mb-2">AI Script Template</p>
            <div className="bg-background/50 rounded-xl p-3 border border-border/60">
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">{campaign.script}</p>
            </div>
          </div>
          {Object.keys(criteria).length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Targeting Criteria</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(criteria).map(([key, val]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    <span className="text-muted-foreground mr-1 capitalize">{key}:</span>
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function CampaignsPage() {
  const activeCampaigns = mockCampaigns.filter((c) => c.status === "ACTIVE").length
  const totalTargeted = mockCampaigns.reduce((s, c) => s + c.leadsTargeted, 0)
  const avgResponse = mockCampaigns.filter((c) => c.responseRate > 0)
  const avgResponseRate = avgResponse.length
    ? (avgResponse.reduce((s, c) => s + c.responseRate, 0) / avgResponse.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outreach Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockCampaigns.length} campaigns · {activeCampaigns} currently active</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: mockCampaigns.length, icon: BarChart3, color: "text-chart-1" },
          { label: "Active Now",      value: activeCampaigns,      icon: Zap,       color: "text-emerald-500" },
          { label: "Leads Targeted",  value: totalTargeted,        icon: Target,    color: "text-chart-2" },
          { label: "Avg Response",    value: `${avgResponseRate}%`, icon: TrendingUp, color: "text-chart-3" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-xl p-4"
          >
            <kpi.icon className={`w-4 h-4 ${kpi.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Status filter pills */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(["ACTIVE", "PAUSED", "DRAFT", "COMPLETED"] as Campaign["status"][]).map((s) => {
              const sc = statusConfig[s]
              const count = mockCampaigns.filter((c) => c.status === s).length
              return (
                <div key={s} className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    <span className="text-xs font-medium text-foreground">{sc.label}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {mockCampaigns.map((campaign, i) => (
          <CampaignCard key={campaign.id} campaign={campaign} index={i} />
        ))}
      </div>
    </div>
  )
}
