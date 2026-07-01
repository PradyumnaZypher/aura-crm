import { motion } from "framer-motion"
import {
  Users, TrendingUp, Target, Phone, HeadphonesIcon,
  Activity, Shield, Zap, AlertCircle, CheckCircle2,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid,
} from "recharts"
import {
  adminStats, revenueData, sentimentData, aiCallVolumeData,
  mockUsers,
} from "@/lib/mock-data"

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
}

const sentimentChartConfig = {
  positive: { label: "Positive", color: "var(--chart-3)" },
  neutral: { label: "Neutral", color: "var(--chart-4)" },
  negative: { label: "Negative", color: "var(--chart-5)" },
}

const callVolumeConfig = {
  calls: { label: "AI Calls", color: "var(--chart-1)" },
  successRate: { label: "Success %", color: "var(--chart-2)" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const topStats = [
  { title: "Total Users", value: adminStats.totalUsers, change: 12, label: "vs last month", icon: Users, color: "text-chart-1" },
  { title: "Monthly Revenue", value: `$${(adminStats.monthlyRevenue / 1000).toFixed(0)}K`, change: 18, label: "vs last month", icon: TrendingUp, color: "text-chart-3" },
  { title: "Active Leads", value: adminStats.totalLeads, change: 9, label: "vs last month", icon: Target, color: "text-chart-2" },
  { title: "AI Calls Today", value: adminStats.aiCallsToday, change: 23, label: "vs yesterday", icon: Phone, color: "text-chart-4" },
  { title: "Avg Sentiment", value: `${adminStats.avgSentimentScore}%`, change: 4, label: "vs last week", icon: Activity, color: "text-chart-3" },
  { title: "Open Tickets", value: adminStats.openTickets, change: -15, label: "vs last week", icon: HeadphonesIcon, color: "text-chart-5" },
  { title: "System Health", value: `${adminStats.systemHealth}%`, icon: Shield, color: "text-chart-3" },
  { title: "Active Users", value: adminStats.activeUsers, change: 5, label: "right now", icon: Zap, color: "text-chart-2" },
]

const recentAlerts = [
  { type: "warning", message: "High ticket volume detected – Support queue", time: "5m ago" },
  { type: "success", message: "AI outreach campaign launched successfully", time: "12m ago" },
  { type: "success", message: "BioGen Labs deal moved to Negotiation stage", time: "28m ago" },
  { type: "warning", message: "Database backup completed with warnings", time: "1h ago" },
]

export default function AdminDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview · Jul 1, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
            All systems operational
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topStats.map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            {stat.change !== undefined && (
              <p className={`text-xs mt-1 font-medium ${stat.change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                {stat.change >= 0 ? "↑" : "↓"} {Math.abs(stat.change)}%
                <span className="text-muted-foreground font-normal ml-1">{stat.label}</span>
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Revenue vs Target</CardTitle>
                <Badge variant="outline" className="text-xs">Last 7 months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill="url(#revenueGrad)" />
                  <Area type="monotone" dataKey="target" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="4 4" fill="url(#targetGrad)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">AI Sentiment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sentimentChartConfig} className="h-[220px] w-full">
                <AreaChart data={sentimentData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="positive" stroke="var(--chart-3)" strokeWidth={2} fill="url(#posGrad)" stackId="1" />
                  <Area type="monotone" dataKey="neutral" stroke="var(--chart-4)" strokeWidth={1.5} fill="var(--chart-4)" fillOpacity={0.1} stackId="2" />
                  <Area type="monotone" dataKey="negative" stroke="var(--chart-5)" strokeWidth={1.5} fill="var(--chart-5)" fillOpacity={0.1} stackId="3" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Call Volume */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">AI Call Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={callVolumeConfig} className="h-[180px] w-full">
                <BarChart data={aiCallVolumeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="calls" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent users */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
                <a href="/admin/users" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs font-semibold gradient-aura text-white">{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : user.role === "MANAGER" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System alerts */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {alert.type === "success"
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Database Storage</span>
                    <span className="font-medium text-foreground">68%</span>
                  </div>
                  <Progress value={68} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">API Rate Limit</span>
                    <span className="font-medium text-foreground">42%</span>
                  </div>
                  <Progress value={42} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
