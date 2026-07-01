import ClientLayout from "@/components/layout/client-layout"
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
