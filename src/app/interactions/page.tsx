"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import {
  Phone, Mail, MessageSquare, Users, FileText,
  Search, Filter, Plus, ChevronRight,
  TrendingUp, Calendar, AlertCircle, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { useSearchParams, useRouter } from "next/navigation"

interface Interaction {
  id: string
  type: string
  title: string
  description?: string
  duration?: number
  createdAt: string
  metadata?: any
}

const typeConfig: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  call:    { icon: Phone,         className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/10", label: "Call" },
  email:   { icon: Mail,          className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/10",       label: "Email" },
  meeting: { icon: Users,         className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/10", label: "Meeting" },
  note:    { icon: FileText,      className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/10", label: "Note" },
}

function SearchParamsReader({ onActionNew }: { onActionNew: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      onActionNew()
    }
  }, [searchParams, onActionNew])
  return null
}

function InteractionCard({ interaction, index }: { interaction: Interaction; index: number }) {
  const typeKey = interaction.type.toLowerCase()
  const tc = typeConfig[typeKey] || { icon: FileText, className: "bg-muted text-muted-foreground", label: interaction.type }
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
            <p className="text-sm font-semibold text-foreground">{interaction.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Logged Client Interaction</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-muted-foreground transition-colors mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{interaction.description || "No description provided."}</p>
        <div className="flex items-center gap-3 mt-2">
          <Badge className={`text-[10px] border ${tc.className}`}>{tc.label}</Badge>
          {interaction.duration && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{interaction.duration}m</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">{new Date(interaction.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  )
}

function InteractionTimeline({ interactions }: { interactions: Interaction[] }) {
  return (
    <div className="relative space-y-0">
      <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border/60" />
      {interactions.map((interaction, index) => {
        const typeKey = interaction.type.toLowerCase()
        const tc = typeConfig[typeKey] || { icon: FileText, className: "bg-muted text-muted-foreground", label: interaction.type }
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
                  <p className="text-sm font-semibold text-foreground leading-tight">{interaction.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(interaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{interaction.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-[10px] border ${tc.className}`}>{tc.label}</Badge>
                {interaction.duration && (
                  <span className="text-xs text-muted-foreground font-medium">{interaction.duration} minutes</span>
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
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [view, setView] = useState<"cards" | "timeline">("cards")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    duration: 30,
    scheduledFor: "",
  })

  const router = useRouter()

  useEffect(() => {
    fetchInteractions()
  }, [])

  const fetchInteractions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/interactions", {
        headers: { "Authorization": `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setInteractions(data.interactions || [])
      }
    } catch (error) {
      console.error("Error fetching interactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setInteractions([data.interaction, ...interactions])
        setShowCreateModal(false)
        setFormData({
          type: "",
          title: "",
          description: "",
          duration: 30,
          scheduledFor: "",
        })
        
        localStorage.setItem("interaction_created", Date.now().toString())
        localStorage.removeItem("interaction_created")
        router.replace("/interactions")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create interaction")
      }
    } catch (error) {
      console.error("Error creating interaction:", error)
      alert("Failed to create interaction")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = interactions.filter((i) => {
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(search.toLowerCase()))
    const matchType = typeFilter === "ALL" || i.type.toLowerCase() === typeFilter.toLowerCase()
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <SearchParamsReader onActionNew={() => setShowCreateModal(true)} />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interactions Center</h1>
          <p className="text-sm text-muted-foreground mt-1">{interactions.length} total client contacts logged</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Log Interaction
        </Button>
      </motion.div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { type: "ALL", label: "All Logs", count: interactions.length, color: "bg-primary/10 text-primary border-primary/20" },
          { type: "call", label: "Calls", count: interactions.filter((i) => i.type.toLowerCase() === "call").length, color: typeConfig.call.className },
          { type: "email", label: "Emails", count: interactions.filter((i) => i.type.toLowerCase() === "email").length, color: typeConfig.email.className },
          { type: "meeting", label: "Meetings", count: interactions.filter((i) => i.type.toLowerCase() === "meeting").length, color: typeConfig.meeting.className },
          { type: "note", label: "Notes", count: interactions.filter((i) => i.type.toLowerCase() === "note").length, color: typeConfig.note.className },
        ].map((c) => (
          <div key={c.type} className="glass-card rounded-xl p-3 text-center border-border">
            <p className="text-xl font-bold text-foreground">{c.count}</p>
            <p className={`text-[10px] font-medium mt-1.5 inline-block px-2 py-0.5 rounded-full border ${c.color}`}>
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
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
            <SelectItem value="call">Phone Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
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

      {/* Content Container */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {view === "timeline" ? "Activity Timeline" : "Recent Interactions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
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

      {/* Create Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Client Interaction</DialogTitle>
            <DialogDescription>Record a new manual check-in or note for audit trails.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Log notes"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  min="1"
                  max="480"
                />
              </div>

              {(formData.type === "call" || formData.type === "meeting") && (
                <div>
                  <Label htmlFor="scheduledFor">Scheduled For</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !formData.type || !formData.title} className="gradient-aura text-white border-0">
                {submitting ? "Logging..." : "Log Interaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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