import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary-deep">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "InterVU — Prepare Smart. Interview Smarter." },
      { name: "description", content: "AI-powered interview preparation: aptitude, coding, HR & company-specific simulations with deep analytics." },
      { property: "og:title", content: "InterVU — Prepare Smart. Interview Smarter." },
      { property: "og:description", content: "AI-powered interview preparation: aptitude, coding, HR & company-specific simulations with deep analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "InterVU — Prepare Smart. Interview Smarter." },
      { name: "twitter:description", content: "AI-powered interview preparation: aptitude, coding, HR & company-specific simulations with deep analytics." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/53d4c713-58c4-43c4-a3de-869ef5a67323/id-preview-1e618425--15b4a192-496b-40e4-91f3-0ba7fb8971e4.lovable.app-1776735508285.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/53d4c713-58c4-43c4-a3de-869ef5a67323/id-preview-1e618425--15b4a192-496b-40e4-91f3-0ba7fb8971e4.lovable.app-1776735508285.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
