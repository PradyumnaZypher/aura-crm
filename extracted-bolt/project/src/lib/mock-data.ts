// ─────────────────────────────────────────────────────────────
// Aura CRM – Comprehensive Mock Data
// ─────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "MANAGER" | "CLIENT"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  initials: string
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin: string
  department?: string
}

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  value: number
  assignedTo?: string
  createdAt: string
  lastActivity: string
  source: string
  tags: string[]
}

export interface CallRecord {
  id: string
  leadName: string
  duration: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  summary: string
  actionItems: string[]
  date: string
  status: "completed" | "in-progress" | "scheduled"
  aiConfidence: number
}

export interface Interaction {
  id: string
  leadName: string
  type: "CALL" | "EMAIL" | "SMS" | "MEETING" | "NOTE"
  subject: string
  summary: string
  date: string
  assignedTo: string
  sentiment?: "positive" | "neutral" | "negative"
}

export interface Campaign {
  id: string
  name: string
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED"
  targetCriteria: string
  responseRate: number
  conversionRate: number
  leadsTargeted: number
  leadsContacted: number
  createdAt: string
  script: string
}

export interface SupportTicket {
  id: string
  title: string
  description: string
  category: "TECHNICAL" | "BILLING" | "FEATURE_REQUEST" | "BUG_REPORT" | "GENERAL"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  assignedTo?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  replies: TicketReply[]
}

export interface TicketReply {
  id: string
  author: string
  content: string
  date: string
  isInternal: boolean
}

export interface Document {
  id: string
  name: string
  category: "CONTRACT" | "INVOICE" | "PROPOSAL" | "REPORT" | "GENERAL"
  size: string
  isPublic: boolean
  uploadedBy: string
  uploadedAt: string
  url: string
}

// ─── Users ───────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: "u1", name: "Elena Vasquez", email: "elena@auracrm.io", role: "ADMIN", initials: "EV", status: "active", createdAt: "2024-01-15", lastLogin: "2026-07-01", department: "Engineering" },
  { id: "u2", name: "Marcus Chen", email: "marcus@auracrm.io", role: "MANAGER", initials: "MC", status: "active", createdAt: "2024-02-20", lastLogin: "2026-06-30", department: "Sales" },
  { id: "u3", name: "Aria Patel", email: "aria@auracrm.io", role: "MANAGER", initials: "AP", status: "active", createdAt: "2024-03-10", lastLogin: "2026-06-29", department: "Customer Success" },
  { id: "u4", name: "Jordan Lee", email: "jordan@client.com", role: "CLIENT", initials: "JL", status: "active", createdAt: "2024-04-05", lastLogin: "2026-06-28", department: "Acme Corp" },
  { id: "u5", name: "Sofia Martinez", email: "sofia@client.com", role: "CLIENT", initials: "SM", status: "pending", createdAt: "2024-05-12", lastLogin: "2026-06-25", department: "TechVentures" },
  { id: "u6", name: "Kai Nakamura", email: "kai@auracrm.io", role: "MANAGER", initials: "KN", status: "active", createdAt: "2024-06-01", lastLogin: "2026-07-01", department: "Outreach" },
  { id: "u7", name: "Zara Williams", email: "zara@client.com", role: "CLIENT", initials: "ZW", status: "inactive", createdAt: "2024-06-15", lastLogin: "2026-05-20", department: "GlobalRetail" },
  { id: "u8", name: "Luca Romano", email: "luca@auracrm.io", role: "ADMIN", initials: "LR", status: "active", createdAt: "2024-07-01", lastLogin: "2026-07-01", department: "DevOps" },
]

// ─── Leads ───────────────────────────────────────────────────
export const mockLeads: Lead[] = [
  { id: "l1", name: "James Whitfield", company: "NovaTech Solutions", email: "james@novatech.io", phone: "+1 (555) 101-2020", status: "NEGOTIATION", priority: "URGENT", value: 120000, assignedTo: "Marcus Chen", createdAt: "2026-05-10", lastActivity: "2026-07-01", source: "Inbound", tags: ["enterprise", "SaaS"] },
  { id: "l2", name: "Priya Sharma", company: "CloudBridge Inc", email: "priya@cloudbridge.com", phone: "+1 (555) 202-3030", status: "PROPOSAL", priority: "HIGH", value: 75000, assignedTo: "Aria Patel", createdAt: "2026-05-22", lastActivity: "2026-06-30", source: "Referral", tags: ["cloud", "mid-market"] },
  { id: "l3", name: "Derek Olson", company: "FinStack Global", email: "derek@finstack.io", phone: "+1 (555) 303-4040", status: "QUALIFIED", priority: "HIGH", value: 95000, assignedTo: "Marcus Chen", createdAt: "2026-06-01", lastActivity: "2026-06-29", source: "Campaign", tags: ["fintech", "enterprise"] },
  { id: "l4", name: "Aisha Okonkwo", company: "RetailPlus", email: "aisha@retailplus.co", phone: "+1 (555) 404-5050", status: "CONTACTED", priority: "MEDIUM", value: 42000, assignedTo: "Kai Nakamura", createdAt: "2026-06-10", lastActivity: "2026-06-27", source: "AI Outreach", tags: ["retail", "smb"] },
  { id: "l5", name: "Tom Bradford", company: "HealthCore Systems", email: "tom@healthcore.com", phone: "+1 (555) 505-6060", status: "NEW", priority: "MEDIUM", value: 58000, assignedTo: undefined, createdAt: "2026-06-15", lastActivity: "2026-06-15", source: "Website", tags: ["healthcare"] },
  { id: "l6", name: "Mei Lin", company: "EduPath Academy", email: "mei@edupath.org", phone: "+1 (555) 606-7070", status: "CLOSED_WON", priority: "HIGH", value: 88000, assignedTo: "Aria Patel", createdAt: "2026-04-01", lastActivity: "2026-06-20", source: "Conference", tags: ["edtech", "mid-market"] },
  { id: "l7", name: "Victor Reyes", company: "AutoDrive Tech", email: "victor@autodrive.io", phone: "+1 (555) 707-8080", status: "CLOSED_LOST", priority: "LOW", value: 32000, assignedTo: "Marcus Chen", createdAt: "2026-03-15", lastActivity: "2026-05-30", source: "Cold Outreach", tags: ["automotive"] },
  { id: "l8", name: "Hannah Strauss", company: "BioGen Labs", email: "hannah@biogen.com", phone: "+1 (555) 808-9090", status: "NEGOTIATION", priority: "URGENT", value: 145000, assignedTo: "Kai Nakamura", createdAt: "2026-05-20", lastActivity: "2026-07-01", source: "Partner Referral", tags: ["biotech", "enterprise"] },
  { id: "l9", name: "Carlos Fuentes", company: "SmartLogistics", email: "carlos@smartlog.com", phone: "+1 (555) 909-1010", status: "QUALIFIED", priority: "MEDIUM", value: 67000, assignedTo: "Aria Patel", createdAt: "2026-06-05", lastActivity: "2026-06-28", source: "LinkedIn", tags: ["logistics"] },
  { id: "l10", name: "Ruby Thornton", company: "GreenEnergy Co", email: "ruby@greenenergy.com", phone: "+1 (555) 010-1111", status: "PROPOSAL", priority: "HIGH", value: 110000, assignedTo: "Marcus Chen", createdAt: "2026-06-08", lastActivity: "2026-06-30", source: "Webinar", tags: ["cleantech", "enterprise"] },
]

// ─── AI Call Records ─────────────────────────────────────────
export const mockCallRecords: CallRecord[] = [
  {
    id: "c1", leadName: "James Whitfield", duration: "12:34", sentiment: "positive", sentimentScore: 87,
    summary: "Client expressed strong interest in enterprise tier. Key concern was integration timeline with existing ERP system. Agreed to schedule technical demo with their CTO.",
    actionItems: ["Schedule CTO demo call", "Send integration documentation", "Prepare ROI calculator"],
    date: "2026-07-01 09:15", status: "completed", aiConfidence: 94,
  },
  {
    id: "c2", leadName: "Hannah Strauss", duration: "08:22", sentiment: "positive", sentimentScore: 92,
    summary: "Very engaged prospect. Asked detailed questions about data security and HIPAA compliance. Confirmed budget approval for Q3 implementation.",
    actionItems: ["Send HIPAA compliance docs", "Connect with legal team", "Prepare contract draft"],
    date: "2026-07-01 10:45", status: "completed", aiConfidence: 97,
  },
  {
    id: "c3", leadName: "Derek Olson", duration: "15:10", sentiment: "neutral", sentimentScore: 61,
    summary: "Long discussion about pricing structure. Client comparing with two competitors. Neutral sentiment – requested a custom pricing proposal for their specific use case.",
    actionItems: ["Prepare custom pricing proposal", "Highlight differentiators", "Follow up in 48 hours"],
    date: "2026-06-30 14:20", status: "completed", aiConfidence: 82,
  },
  {
    id: "c4", leadName: "Aisha Okonkwo", duration: "05:45", sentiment: "neutral", sentimentScore: 55,
    summary: "Brief initial contact. Client was unavailable for full discussion. Agreed to reschedule for next Tuesday. Mentioned interest in retail AI features.",
    actionItems: ["Reschedule for Tuesday 2pm", "Send product overview deck"],
    date: "2026-06-30 11:00", status: "completed", aiConfidence: 78,
  },
  {
    id: "c5", leadName: "Priya Sharma", duration: "18:05", sentiment: "positive", sentimentScore: 89,
    summary: "Extremely positive call. Client ready to move to contract stage. Needs approval from CFO. Budget confirmed at $75K. Expected close date end of July.",
    actionItems: ["Draft contract", "Schedule CFO meeting", "Send executive summary"],
    date: "2026-06-29 16:30", status: "completed", aiConfidence: 96,
  },
  {
    id: "c6", leadName: "Ruby Thornton", duration: "03:20", sentiment: "negative", sentimentScore: 28,
    summary: "Client expressed frustration with delayed proposal response. Felt follow-up was insufficient. Risk of losing opportunity. Immediate escalation recommended.",
    actionItems: ["Escalate to manager", "Send apology and revised timeline", "Priority demo scheduling"],
    date: "2026-06-28 09:00", status: "completed", aiConfidence: 88,
  },
]

// ─── Interactions ─────────────────────────────────────────────
export const mockInteractions: Interaction[] = [
  { id: "i1", leadName: "James Whitfield", type: "CALL", subject: "Q3 Enterprise Demo Follow-up", summary: "Discussed integration timeline and pricing", date: "2026-07-01 09:15", assignedTo: "Marcus Chen", sentiment: "positive" },
  { id: "i2", leadName: "Hannah Strauss", type: "EMAIL", subject: "HIPAA Compliance Package Sent", summary: "Sent compliance documentation and security whitepaper", date: "2026-07-01 11:20", assignedTo: "Kai Nakamura", sentiment: "positive" },
  { id: "i3", leadName: "Priya Sharma", type: "MEETING", subject: "Contract Review Session", summary: "In-person meeting at CloudBridge HQ to review contract terms", date: "2026-06-30 14:00", assignedTo: "Aria Patel", sentiment: "positive" },
  { id: "i4", leadName: "Derek Olson", type: "CALL", subject: "Custom Pricing Discussion", summary: "Walked through pricing tiers and negotiated discount structure", date: "2026-06-30 14:20", assignedTo: "Marcus Chen", sentiment: "neutral" },
  { id: "i5", leadName: "Tom Bradford", type: "EMAIL", subject: "Welcome & Product Introduction", summary: "Initial outreach email with product overview and next steps", date: "2026-06-29 08:45", assignedTo: "Kai Nakamura" },
  { id: "i6", leadName: "Ruby Thornton", type: "NOTE", subject: "Internal Escalation Note", summary: "Client frustrated – escalated to manager. Immediate action required.", date: "2026-06-28 09:30", assignedTo: "Marcus Chen", sentiment: "negative" },
  { id: "i7", leadName: "Aisha Okonkwo", type: "SMS", subject: "Meeting Rescheduling", summary: "Sent SMS to reschedule Tuesday call", date: "2026-06-27 16:00", assignedTo: "Kai Nakamura" },
  { id: "i8", leadName: "Carlos Fuentes", type: "EMAIL", subject: "Proposal Submission", summary: "Sent detailed proposal document for Q3 contract", date: "2026-06-26 10:30", assignedTo: "Aria Patel", sentiment: "positive" },
]

// ─── Campaigns ────────────────────────────────────────────────
export const mockCampaigns: Campaign[] = [
  {
    id: "camp1", name: "Enterprise SaaS Outreach Q3", status: "ACTIVE",
    targetCriteria: '{"industry": ["SaaS", "FinTech"], "companySize": "100-500", "revenue": ">$10M"}',
    responseRate: 34.2, conversionRate: 12.8, leadsTargeted: 520, leadsContacted: 178,
    createdAt: "2026-06-01",
    script: "Hi {{firstName}}, I'm reaching out because your company {{companyName}} matches the profile of organizations that have achieved 3x ROI using our AI-powered CRM platform...",
  },
  {
    id: "camp2", name: "Healthcare AI Pilot Program", status: "ACTIVE",
    targetCriteria: '{"industry": ["Healthcare", "BioTech"], "companySize": "50-200", "region": "North America"}',
    responseRate: 41.5, conversionRate: 18.3, leadsTargeted: 280, leadsContacted: 116,
    createdAt: "2026-06-15",
    script: "Hello {{firstName}}, Healthcare organizations like {{companyName}} are transforming patient outcomes using AI voice analytics...",
  },
  {
    id: "camp3", name: "SMB Retail Modernization", status: "PAUSED",
    targetCriteria: '{"industry": ["Retail", "E-Commerce"], "companySize": "10-50", "techStack": ["Shopify", "WooCommerce"]}',
    responseRate: 22.1, conversionRate: 8.5, leadsTargeted: 640, leadsContacted: 141,
    createdAt: "2026-05-20",
    script: "Hi {{firstName}}, small retail teams using our platform see 40% more conversions in the first 90 days...",
  },
  {
    id: "camp4", name: "CleanTech Green Initiatives", status: "DRAFT",
    targetCriteria: '{"industry": ["CleanEnergy", "Sustainability"], "funding": "Series B+"}',
    responseRate: 0, conversionRate: 0, leadsTargeted: 0, leadsContacted: 0,
    createdAt: "2026-07-01",
    script: "Template pending review...",
  },
]

// ─── Support Tickets ──────────────────────────────────────────
export const mockTickets: SupportTicket[] = [
  {
    id: "t1", title: "API Integration Timeout Issues", description: "Our webhook integration keeps timing out after 30 seconds during high load. This is critical for our production deployment.",
    category: "TECHNICAL", priority: "URGENT", status: "IN_PROGRESS", assignedTo: "Elena Vasquez", createdBy: "Jordan Lee", createdAt: "2026-07-01 08:00", updatedAt: "2026-07-01 10:30",
    replies: [
      { id: "r1", author: "Elena Vasquez", content: "Hi Jordan, I've identified the issue – it's a timeout configuration on our load balancer. Working on a fix now. ETA: 2 hours.", date: "2026-07-01 09:15", isInternal: false },
      { id: "r2", author: "Elena Vasquez", content: "Internal: This looks like the same issue from last month. Need to update the ALB config.", date: "2026-07-01 09:16", isInternal: true },
    ],
  },
  {
    id: "t2", title: "Invoice #INV-2026-0089 Dispute", description: "We were charged twice for the Pro tier upgrade on June 15. Please review and issue a refund for the duplicate charge of $299.",
    category: "BILLING", priority: "HIGH", status: "OPEN", assignedTo: undefined, createdBy: "Sofia Martinez", createdAt: "2026-06-30 15:00", updatedAt: "2026-06-30 15:00",
    replies: [],
  },
  {
    id: "t3", title: "Feature Request: Bulk Lead Import", description: "Would love to see a CSV bulk import feature for leads. Currently uploading 500+ leads one by one takes hours.",
    category: "FEATURE_REQUEST", priority: "MEDIUM", status: "OPEN", assignedTo: "Luca Romano", createdBy: "Zara Williams", createdAt: "2026-06-28 11:30", updatedAt: "2026-06-29 09:00",
    replies: [
      { id: "r3", author: "Luca Romano", content: "Great suggestion! I've added this to our product roadmap. Target release: Q4 2026.", date: "2026-06-29 09:00", isInternal: false },
    ],
  },
  {
    id: "t4", title: "Dashboard Charts Not Rendering", description: "The analytics charts on the manager dashboard are completely blank since the v2.3 update last week.",
    category: "BUG_REPORT", priority: "HIGH", status: "RESOLVED", assignedTo: "Elena Vasquez", createdBy: "Marcus Chen", createdAt: "2026-06-25 14:00", updatedAt: "2026-06-26 16:00",
    replies: [
      { id: "r4", author: "Elena Vasquez", content: "Fixed in hotfix v2.3.1 – chart library version conflict resolved. Please refresh and let me know if the issue persists.", date: "2026-06-26 16:00", isInternal: false },
    ],
  },
]

// ─── Documents ────────────────────────────────────────────────
export const mockDocuments: Document[] = [
  { id: "d1", name: "Master Service Agreement - NovaTech 2026", category: "CONTRACT", size: "2.4 MB", isPublic: false, uploadedBy: "Marcus Chen", uploadedAt: "2026-07-01", url: "#" },
  { id: "d2", name: "Invoice INV-2026-0089 - CloudBridge", category: "INVOICE", size: "156 KB", isPublic: false, uploadedBy: "Aria Patel", uploadedAt: "2026-06-30", url: "#" },
  { id: "d3", name: "Q3 Enterprise Proposal - FinStack", category: "PROPOSAL", size: "3.1 MB", isPublic: false, uploadedBy: "Marcus Chen", uploadedAt: "2026-06-28", url: "#" },
  { id: "d4", name: "Aura CRM Q2 Performance Report", category: "REPORT", size: "5.7 MB", isPublic: true, uploadedBy: "Elena Vasquez", uploadedAt: "2026-07-01", url: "#" },
  { id: "d5", name: "Onboarding Guide v3.2", category: "GENERAL", size: "890 KB", isPublic: true, uploadedBy: "Luca Romano", uploadedAt: "2026-06-20", url: "#" },
  { id: "d6", name: "Security & Compliance Whitepaper", category: "REPORT", size: "1.2 MB", isPublic: true, uploadedBy: "Elena Vasquez", uploadedAt: "2026-06-15", url: "#" },
  { id: "d7", name: "BioGen Labs Proposal Draft", category: "PROPOSAL", size: "2.8 MB", isPublic: false, uploadedBy: "Kai Nakamura", uploadedAt: "2026-06-25", url: "#" },
  { id: "d8", name: "HIPAA Compliance Certificate 2026", category: "CONTRACT", size: "445 KB", isPublic: false, uploadedBy: "Elena Vasquez", uploadedAt: "2026-05-30", url: "#" },
]

// ─── Analytics / Chart Data ───────────────────────────────────
export const revenueData = [
  { month: "Jan", revenue: 42000, target: 50000, deals: 8 },
  { month: "Feb", revenue: 58000, target: 55000, deals: 11 },
  { month: "Mar", revenue: 51000, target: 60000, deals: 9 },
  { month: "Apr", revenue: 73000, target: 65000, deals: 14 },
  { month: "May", revenue: 89000, target: 70000, deals: 17 },
  { month: "Jun", revenue: 95000, target: 75000, deals: 19 },
  { month: "Jul", revenue: 112000, target: 80000, deals: 22 },
]

export const sentimentData = [
  { date: "Jun 25", positive: 68, neutral: 22, negative: 10 },
  { date: "Jun 26", positive: 72, neutral: 18, negative: 10 },
  { date: "Jun 27", positive: 65, neutral: 25, negative: 10 },
  { date: "Jun 28", positive: 78, neutral: 14, negative: 8 },
  { date: "Jun 29", positive: 81, neutral: 12, negative: 7 },
  { date: "Jun 30", positive: 75, neutral: 17, negative: 8 },
  { date: "Jul 1",  positive: 84, neutral: 10, negative: 6 },
]

export const pipelineData = [
  { stage: "New", count: 24, value: 820000 },
  { stage: "Contacted", count: 18, value: 642000 },
  { stage: "Qualified", count: 12, value: 518000 },
  { stage: "Proposal", count: 8, value: 412000 },
  { stage: "Negotiation", count: 5, value: 265000 },
  { stage: "Won", count: 11, value: 988000 },
]

export const aiCallVolumeData = [
  { day: "Mon", calls: 34, avgDuration: 9.2, successRate: 72 },
  { day: "Tue", calls: 41, avgDuration: 11.5, successRate: 78 },
  { day: "Wed", calls: 38, avgDuration: 10.1, successRate: 75 },
  { day: "Thu", calls: 52, avgDuration: 12.8, successRate: 83 },
  { day: "Fri", calls: 47, avgDuration: 11.0, successRate: 80 },
  { day: "Sat", calls: 18, avgDuration: 8.5, successRate: 68 },
  { day: "Sun", calls: 12, avgDuration: 7.2, successRate: 62 },
]

export const userRetentionData = [
  { week: "W1", retention: 100, active: 145 },
  { week: "W2", retention: 88, active: 128 },
  { week: "W3", retention: 82, active: 119 },
  { week: "W4", retention: 79, active: 115 },
  { week: "W5", retention: 76, active: 110 },
  { week: "W6", retention: 74, active: 107 },
  { week: "W7", retention: 78, active: 113 },
  { week: "W8", retention: 81, active: 118 },
]

// ─── Dashboard Stats ──────────────────────────────────────────
export const adminStats = {
  totalUsers: 248,
  activeUsers: 187,
  totalLeads: 1842,
  monthlyRevenue: 112000,
  aiCallsToday: 47,
  avgSentimentScore: 78,
  openTickets: 12,
  systemHealth: 99.7,
}

export const managerStats = {
  teamMembers: 6,
  activeLeads: 38,
  pipelineValue: 2645000,
  weeklyCallsMade: 242,
  conversionRate: 22.8,
  avgDealSize: 78500,
}

export const clientStats = {
  activeLeads: 3,
  scheduledCalls: 2,
  openTickets: 1,
  pendingDocuments: 2,
  contractValue: 120000,
  nextCallDate: "Jul 3, 2026 – 10:00 AM",
}

// ─── Calendar Events (Client) ─────────────────────────────────
export const clientCalendarEvents = [
  { id: "ev1", title: "AI Follow-up Call", date: "2026-07-03", time: "10:00 AM", type: "call", lead: "NovaTech Solutions" },
  { id: "ev2", title: "Contract Review", date: "2026-07-05", time: "2:00 PM", type: "meeting", lead: "Internal" },
  { id: "ev3", title: "Demo Session", date: "2026-07-08", time: "11:00 AM", type: "demo", lead: "CloudBridge Inc" },
  { id: "ev4", title: "Onboarding Check-in", date: "2026-07-10", time: "3:00 PM", type: "call", lead: "Internal" },
]
