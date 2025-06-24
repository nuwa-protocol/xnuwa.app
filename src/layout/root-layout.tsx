import { Toaster } from "sonner";
import { AuthGuard } from "./components/auth-guard";
import { ThemeProvider } from "./components/theme-provider";
import "./globals.css";
import { Outlet } from "react-router-dom";


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
