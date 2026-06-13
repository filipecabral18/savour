import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define a rota do painel da hostess e suas sub-rotas como protegidas
const isProtectedRoute = createRouteMatcher([
  "/hostess(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Redireciona automaticamente para a página de login (/sign-in) se não autenticado
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
