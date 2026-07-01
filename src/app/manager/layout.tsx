import ManagerLayout from "@/components/layout/manager-layout"
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return <ManagerLayout>{children}</ManagerLayout>
}
