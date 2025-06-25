import { Toaster } from "sonner";
import { AuthGuard } from "@/features/auth/components";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../shared/components/theme-provider";
import "./globals.css";

export default function RootLayout() {
  return (
    <ThemeProvider
      defaultTheme="light" storageKey="nuwa-ui-theme"
    >
      <AuthGuard>
        <Toaster position="top-center" />
        <Outlet />
      </AuthGuard>
    </ThemeProvider>
  );
}
