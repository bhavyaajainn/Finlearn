"use client"

import type React from "react"

import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return [debouncedValue, setDebouncedValue]
}
