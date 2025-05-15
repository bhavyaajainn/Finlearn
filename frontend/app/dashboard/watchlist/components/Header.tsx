import { Bell, HelpCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchAssets from "./search-bar"

export default function Header() {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-blue-500">Fin</span>Learn
        </h1>
        <p className="text-muted-foreground mt-1">Monitor your financial assets with AI-powered insights</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <SearchAssets />

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
