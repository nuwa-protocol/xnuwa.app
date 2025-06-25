import { Toaster } from "sonner";
import { AuthGuard } from "@/features/auth/components";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import "./globals.css";

export default function RootLayout() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthGuard>
        <Toaster position="top-center" />
        <Outlet />
      </AuthGuard>
    </ThemeProvider>
  );
}
