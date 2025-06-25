import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "nuwa-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      const storedTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme
      return storedTheme === "system" ? systemTheme : storedTheme
    }
    return "light"
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let nextResolvedTheme: "light" | "dark" = "light"
    if (theme === "system") {
      nextResolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(nextResolvedTheme)
    } else {
      nextResolvedTheme = theme
      root.classList.add(theme)
    }
    setResolvedTheme(nextResolvedTheme)

    if (theme === "system") {
      // 监听系统主题变化
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => {
        const systemTheme = media.matches ? "dark" : "light"
        setResolvedTheme(systemTheme)
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }
      media.addEventListener("change", handler)
      return () => media.removeEventListener("change", handler)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}