import AdminLayout from "@/components/layout/admin-layout"
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
