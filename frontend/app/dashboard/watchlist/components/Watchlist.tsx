"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WatchList from "./List"
import Header from "./Header"
import WeeklyResearch from "./Research"

export function Watchlist() {

  return (
    <>
     <div className="container mx-auto px-4 py-6">
      <Header />

      <Tabs defaultValue="watchlist" className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="watchlist">WatchList</TabsTrigger>
          <TabsTrigger value="research">Weekly Research</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="space-y-6">
          <WatchList />
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <WeeklyResearch/>
        </TabsContent>
      </Tabs>
    </div>

    </>
  )
}
