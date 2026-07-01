import { motion } from "framer-motion"
import { TrendingUp, Users, Target, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts"
import { revenueData, sentimentData, userRetentionData, pipelineData } from "@/lib/mock-data"

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
}
const sentimentConfig = {
  positive: { label: "Positive", color: "var(--chart-3)" },
  neutral: { label: "Neutral", color: "var(--chart-4)" },
  negative: { label: "Negative", color: "var(--chart-5)" },
}
const retentionConfig = {
  retention: { label: "Retention %", color: "var(--chart-1)" },
  active: { label: "Active Users", color: "var(--chart-2)" },
}
const pipelineConfig = {
  value: { label: "Pipeline Value", color: "var(--chart-1)" },
  count: { label: "Count", color: "var(--chart-2)" },
}

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide performance metrics</p>
        </div>
        <Badge variant="outline" className="text-xs">Last 30 days</Badge>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: "$648K", change: "+18%", icon: TrendingUp },
          { title: "New Users", value: "+47", change: "+12%", icon: Users },
          { title: "Leads Converted", value: "22.8%", change: "+4.2%", icon: Target },
          { title: "AI Calls Made", value: "1,847", change: "+31%", icon: Phone },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
              <kpi.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-emerald-500 mt-1">{kpi.change} vs last period</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-[240px] w-full">
                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#revGrad2)" />
                  <Area type="monotone" dataKey="target" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sentimentConfig} className="h-[240px] w-full">
                <AreaChart data={sentimentData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="positive" stroke="var(--chart-3)" strokeWidth={2} fill="var(--chart-3)" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="neutral" stroke="var(--chart-4)" strokeWidth={1.5} fill="var(--chart-4)" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="negative" stroke="var(--chart-5)" strokeWidth={1.5} fill="var(--chart-5)" fillOpacity={0.15} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Retention + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">User Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={retentionConfig} className="h-[200px] w-full">
                <LineChart data={userRetentionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="retention" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ fill: "var(--chart-1)", r: 4 }} />
                  <Line type="monotone" dataKey="active" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pipeline by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pipelineConfig} className="h-[200px] w-full">
                <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pipeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="url(#pipeGrad)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
