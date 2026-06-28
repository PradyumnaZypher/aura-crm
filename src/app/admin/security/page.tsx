'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Settings,
  Lock,
  Key,
  Eye,
  Database,
  AlertTriangle
} from 'lucide-react'
import SecurityDashboard from '@/components/admin/security-dashboard'
import SecuritySettings from '@/components/admin/security-settings'
import UserActivityLogs from '@/components/admin/user-activity-logs'
import SecurityAuditLogs from '@/components/admin/security-audit-logs'

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
        <p className="text-gray-600">Manage and monitor system security</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <UserActivityLogs />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <SecurityAuditLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}