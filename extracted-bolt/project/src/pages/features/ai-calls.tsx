import { useState } from "react"
import { motion } from "framer-motion"
import {
  Phone, Play, Pause, Download, ChevronDown, ChevronUp,
  Sparkles, TrendingUp, Clock, Mic, AlertCircle, CheckCircle2,
  BarChart3, Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts"
import { mockCallRecords, aiCallVolumeData, sentimentData } from "@/lib/mock-data"
import type { CallRecord } from "@/lib/mock-data"

const sentimentConfig = {
  positive: { label: "Positive %", color: "var(--chart-3)" },
}
const callVolConfig = {
  calls: { label: "Calls", color: "var(--chart-1)" },
}

function SentimentMeter({ score, sentiment }: { score: number; sentiment: CallRecord["sentiment"] }) {
  const color =
    sentiment === "positive" ? "bg-emerald-500" :
    sentiment === "negative" ? "bg-red-500" :
    "bg-amber-500"
  const textColor =
    sentiment === "positive" ? "text-emerald-500" :
    sentiment === "negative" ? "text-red-500" :
    "text-amber-500"
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground capitalize">{sentiment}</span>
        <span className={`font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function FakeWaveform() {
  const bars = Array.from({ length: 40 }, (_, i) => ({
    h: Math.random() * 60 + 10,
    active: i < 26,
  }))
  return (
    <div className="flex items-center gap-0.5 h-10">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`rounded-full flex-shrink-0 w-[3px] transition-opacity ${b.active ? "bg-primary opacity-80" : "bg-muted-foreground opacity-30"}`}
          style={{ height: `${b.h}%` }}
        />
      ))}
    </div>
  )
}

function CallCard({ call, index }: { call: CallRecord; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-xs font-bold gradient-aura text-white">
                {call.leadName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-foreground">{call.leadName}</p>
              <p className="text-xs text-muted-foreground">{call.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-xs ${
                call.sentiment === "positive" ? "border-emerald-500/30 text-emerald-500" :
                call.sentiment === "negative" ? "border-red-500/30 text-red-500" :
                "border-amber-500/30 text-amber-500"
              }`}
            >
              {call.sentimentScore}% {call.sentiment}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="w-3 h-3" />
              {call.duration}
            </Badge>
          </div>
        </div>

        {/* Sentiment meter */}
        <div className="mt-4">
          <SentimentMeter score={call.sentimentScore} sentiment={call.sentiment} />
        </div>

        {/* AI confidence */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Confidence
          </div>
          <span className="font-semibold text-foreground">{call.aiConfidence}%</span>
        </div>
        <Progress value={call.aiConfidence} className="h-1 mt-1" />
      </div>

      {/* Audio player */}
      <div className="px-4 pb-4">
        <div className="bg-background/50 rounded-xl p-3 border border-border/60">
          <div className="flex items-center gap-3 mb-2">
            <Button
              size="icon-sm"
              variant="ghost"
              className="gradient-aura text-white rounded-full flex-shrink-0"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <FakeWaveform />
            <Button size="icon-sm" variant="ghost" className="flex-shrink-0">
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>3:24</span>
            <span>{call.duration}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI Summary & Action Items
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 space-y-3"
        >
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <p className="text-xs font-medium text-foreground mb-1.5">AI Summary</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{call.summary}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Action Items</p>
            <div className="space-y-1.5">
              {call.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AiCallsPage() {
  const totalCalls = mockCallRecords.length
  const avgSentiment = Math.round(mockCallRecords.reduce((s, c) => s + c.sentimentScore, 0) / totalCalls)
  const positiveCalls = mockCallRecords.filter((c) => c.sentiment === "positive").length
  const avgDuration = "10:23"

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Call Center</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCalls} recorded sessions · sentiment analysis powered by AI</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <Phone className="w-4 h-4" />
          Start AI Call
        </Button>
      </motion.div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: totalCalls, icon: Mic, color: "text-chart-1" },
          { label: "Avg Sentiment", value: `${avgSentiment}%`, icon: TrendingUp, color: "text-chart-3" },
          { label: "Positive Calls", value: `${positiveCalls}/${totalCalls}`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Avg Duration", value: avgDuration, icon: Clock, color: "text-chart-2" },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Weekly Call Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={callVolConfig} className="h-[180px] w-full">
                <BarChart data={aiCallVolumeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="callBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="calls" fill="url(#callBarGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Sentiment Trend (7-Day)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sentimentConfig} className="h-[180px] w-full">
                <LineChart data={sentimentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="positive" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ fill: "var(--chart-3)", r: 3 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Call cards grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Recent Call Sessions</h2>
          <div className="flex items-center gap-2">
            {["positive", "neutral", "negative"].map((s) => (
              <Badge
                key={s}
                variant="outline"
                className={`text-xs capitalize ${
                  s === "positive" ? "border-emerald-500/30 text-emerald-500" :
                  s === "negative" ? "border-red-500/30 text-red-500" :
                  "border-amber-500/30 text-amber-500"
                }`}
              >
                {mockCallRecords.filter((c) => c.sentiment === s).length} {s}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockCallRecords.map((call, i) => (
            <CallCard key={call.id} call={call} index={i} />
          ))}
        </div>
      </div>

      {/* Negative alert */}
      {mockCallRecords.some((c) => c.sentiment === "negative") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Action Required</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mockCallRecords.filter((c) => c.sentiment === "negative").length} call(s) with negative sentiment detected. Review flagged sessions and escalate to your manager.
            </p>
          </div>
          <Button size="sm" variant="outline" className="flex-shrink-0 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10">
            Review
          </Button>
        </motion.div>
      )}
    </div>
  )
}
