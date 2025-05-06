import DashboardNavbar from "@/components/DashboardNavbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex w-full min-h-screen bg-black">
          {/* Sidebar for mobile only */}
          <div className="block md:hidden">
            <AppSidebar />
          </div>

          <div className="flex flex-col flex-1">
            {/* Top navbar for md+ */}
            <div className="hidden md:block">
              <DashboardNavbar />
            </div>

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
