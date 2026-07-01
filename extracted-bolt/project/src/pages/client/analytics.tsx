import { motion } from "framer-motion"
import { TrendingUp, Target, Phone, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts"
import { revenueData, sentimentData, pipelineData } from "@/lib/mock-data"

const progressConfig = {
  revenue: { label: "Deal Value", color: "var(--chart-1)" },
}
const sentimentConfig = {
  positive: { label: "Positive", color: "var(--chart-3)" },
}
const pipeConfig = {
  value: { label: "Value", color: "var(--chart-1)" },
}

// Client-scoped data (subset)
const myProgressData = revenueData.map((d) => ({ ...d, revenue: Math.round(d.revenue * 0.12) }))

export default function ClientAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Progress tracking & engagement metrics</p>
        </div>
        <Badge variant="outline" className="text-xs">Acme Corp · Q3 2026</Badge>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Deal Progress", value: "68%", change: "+12%", icon: Target, desc: "vs last month" },
          { title: "Calls Completed", value: "8", change: "+3", icon: Phone, desc: "this quarter" },
          { title: "Sentiment Score", value: "87%", change: "+5%", icon: TrendingUp, desc: "positive trend" },
          { title: "Actions Completed", value: "14/18", change: "78%", icon: CheckCircle2, desc: "completion rate" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
              <kpi.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">
              {kpi.change} <span className="text-muted-foreground font-normal">{kpi.desc}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Deal Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={progressConfig} className="h-[220px] w-full">
                <AreaChart data={myProgressData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clientRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#clientRevGrad)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">AI Sentiment on My Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sentimentConfig} className="h-[220px] w-full">
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

      {/* Pipeline stages */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Lead Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pipeConfig} className="h-[180px] w-full">
              <BarChart data={pipelineData.slice(0, 4)} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientPipeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--chart-1)" />
                    <stop offset="100%" stopColor="var(--chart-2)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="url(#clientPipeGrad)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
