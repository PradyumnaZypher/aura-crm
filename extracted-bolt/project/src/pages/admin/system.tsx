import { useState } from "react"
import { motion } from "framer-motion"
import {
  Database, Shield, Activity, RefreshCw, Trash2,
  Server, HardDrive, Cpu, CheckCircle2,
  AlertCircle, Download, Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

const systemMetrics = [
  { label: "CPU Usage", value: 34, color: "text-chart-2", icon: Cpu },
  { label: "Memory", value: 58, color: "text-chart-3", icon: Server },
  { label: "Storage", value: 68, color: "text-chart-4", icon: HardDrive },
  { label: "API Rate", value: 42, color: "text-chart-1", icon: Activity },
]

const securityLogs = [
  { event: "Admin login from new device", user: "Elena Vasquez", time: "2026-07-01 09:12", level: "warn" },
  { event: "Failed login attempt", user: "unknown@hack.io", time: "2026-07-01 08:55", level: "error" },
  { event: "API key rotated", user: "Luca Romano", time: "2026-06-30 17:40", level: "info" },
  { event: "Database backup completed", user: "System", time: "2026-06-30 03:00", level: "info" },
  { event: "Permission changed: Kai Nakamura", user: "Elena Vasquez", time: "2026-06-29 14:22", level: "info" },
]

export default function AdminSystem() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    autoBackups: true,
    aiCallRecording: true,
    emailNotifications: true,
    twoFactorAuth: true,
    rateLimiting: true,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform configuration and health monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
            System v2.4.1
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <metric.icon className={`w-3.5 h-3.5 ${metric.color}`} />
                      <span className="text-muted-foreground">{metric.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last Backup</span>
                <span className="font-medium text-foreground">Jun 30, 03:00 AM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Next Backup</span>
                <span className="font-medium text-foreground">Jul 1, 03:00 AM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Records</span>
                <span className="font-medium text-foreground">847,291</span>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                  <Upload className="w-3 h-3" />
                  Restore
                </Button>
              </div>
              <Button size="sm" className="w-full gap-1.5 text-xs gradient-aura text-white border-0">
                <RefreshCw className="w-3 h-3" />
                Run Backup Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Disable access for non-admins" },
                { key: "autoBackups" as const, label: "Auto Backups", desc: "Daily 3:00 AM UTC" },
                { key: "aiCallRecording" as const, label: "AI Call Recording", desc: "Record all AI sessions" },
                { key: "emailNotifications" as const, label: "Email Notifications", desc: "System alerts via email" },
                { key: "twoFactorAuth" as const, label: "Force 2FA", desc: "Require for all users" },
                { key: "rateLimiting" as const, label: "API Rate Limiting", desc: "1000 req/min per key" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={() => toggle(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                Cleanup Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Clear expired sessions",
                "Purge old audit logs (>90d)",
                "Compress archived files",
                "Remove orphan records",
              ].map((task) => (
                <div key={task} className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">{task}</span>
                  <Button size="xs" variant="outline">Run</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Security Logs */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  {log.level === "error" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  ) : log.level === "warn" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{log.event}</p>
                    <p className="text-xs text-muted-foreground truncate">{log.user}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{log.time}</p>
                  </div>
                  <Badge
                    variant={log.level === "error" ? "destructive" : "outline"}
                    className="text-[10px] flex-shrink-0"
                  >
                    {log.level}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 text-xs">
              View Full Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
