"use client"

import { store } from "@/app/store"
import { Provider } from "react-redux"
import { ReactNode } from "react"
import { ReactQueryProvider } from "./queryClient"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ReactQueryProvider>
        {children}
      </ReactQueryProvider>
    </Provider>
  )
}