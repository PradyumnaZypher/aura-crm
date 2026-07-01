import { useState } from "react"
import { motion } from "framer-motion"
import {
  Upload, Search, FileText, File, Receipt, BarChart3,
  ScrollText, Globe, Lock, Download, Eye, Trash2, MoreHorizontal,
  Plus, FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockDocuments } from "@/lib/mock-data"
import type { Document } from "@/lib/mock-data"

const categoryConfig: Record<Document["category"], { label: string; icon: React.ElementType; className: string }> = {
  CONTRACT: { label: "Contract",  icon: ScrollText, className: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  INVOICE:  { label: "Invoice",   icon: Receipt,    className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" },
  PROPOSAL: { label: "Proposal",  icon: FileText,   className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  REPORT:   { label: "Report",    icon: BarChart3,  className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  GENERAL:  { label: "General",   icon: File,       className: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
}

function DocumentRow({ doc, index }: { doc: Document; index: number }) {
  const cc = categoryConfig[doc.category]
  const Icon = cc.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-muted/10 transition-colors group"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cc.className}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Name & meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{doc.size}</span>
          <span className="text-muted-foreground/30">·</span>
          <div className="flex items-center gap-1">
            <Avatar className="w-3.5 h-3.5">
              <AvatarFallback className="text-[8px] gradient-aura text-white">
                {doc.uploadedBy.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{doc.uploadedBy}</span>
          </div>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-xs text-muted-foreground">{doc.uploadedAt}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className={`text-[10px] border-0 hidden sm:inline-flex ${cc.className}`}>{cc.label}</Badge>
        {doc.isPublic ? (
          <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/30 text-emerald-500 hidden md:inline-flex">
            <Globe className="w-2.5 h-2.5" />
            Public
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] gap-1 border-border text-muted-foreground hidden md:inline-flex">
            <Lock className="w-2.5 h-2.5" />
            Private
          </Badge>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="w-3.5 h-3.5 mr-2" /> Preview
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="w-3.5 h-3.5 mr-2" /> Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  const filtered = mockDocuments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "ALL" || d.category === categoryFilter
    return matchSearch && matchCat
  })

  const categoryCounts = Object.fromEntries(
    (["ALL", "CONTRACT", "INVOICE", "PROPOSAL", "REPORT", "GENERAL"] as const).map(
      (c) => [c, c === "ALL" ? mockDocuments.length : mockDocuments.filter((d) => d.category === c).length]
    )
  )

  const totalSize = mockDocuments.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalSize} documents · {mockDocuments.filter((d) => d.isPublic).length} public</p>
        </div>
        <Button className="gradient-aura text-white border-0 gap-2">
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
      </motion.div>

      {/* Category quick-access */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(["ALL", "CONTRACT", "INVOICE", "PROPOSAL", "REPORT", "GENERAL"] as const).map((cat, i) => {
          const isAll = cat === "ALL"
          const cfg = isAll ? null : categoryConfig[cat]
          const Icon = isAll ? FolderOpen : cfg!.icon
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setCategoryFilter(cat)}
              className={`glass-card rounded-xl p-3 text-center transition-all border ${
                categoryFilter === cat
                  ? "border-primary/50 bg-primary/5 glow-violet"
                  : "border-transparent hover:border-primary/20"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                isAll ? "bg-primary/15" : cfg!.className
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-medium text-foreground">{isAll ? "All" : categoryConfig[cat].label}</p>
              <p className="text-base font-bold text-foreground">{categoryCounts[cat]}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} files</span>
      </div>

      {/* Document list by category */}
      {categoryFilter === "ALL" ? (
        (["CONTRACT", "INVOICE", "PROPOSAL", "REPORT", "GENERAL"] as Document["category"][]).map((cat) => {
          const docs = filtered.filter((d) => d.category === cat)
          if (docs.length === 0) return null
          const cfg = categoryConfig[cat]
          const CatIcon = cfg.icon
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cfg.className}`}>
                  <CatIcon className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{cfg.label}s</h2>
                <span className="text-xs text-muted-foreground">({docs.length})</span>
              </div>
              <div className="space-y-2">
                {docs.map((doc, i) => (
                  <DocumentRow key={doc.id} doc={doc} index={i} />
                ))}
              </div>
            </div>
          )
        })
      ) : (
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {categoryFilter === "ALL" ? "All Documents" : categoryConfig[categoryFilter as Document["category"]].label}s
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.map((doc, i) => (
                <DocumentRow key={doc.id} doc={doc} index={i} />
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No documents found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload drop zone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Drop files here to upload</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX · Up to 50MB</p>
      </motion.div>
    </div>
  )
}
