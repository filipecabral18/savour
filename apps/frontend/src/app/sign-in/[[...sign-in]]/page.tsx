import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand header */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-4xl font-bold text-secondary-500 tracking-tight">Savour</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-1">
            Painel Hostess
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <SignIn
          appearance={{
            elements: {
              card: "shadow-md border border-neutral-200 rounded-2xl bg-white p-2",
              headerTitle: "font-serif text-xl font-bold text-neutral-900 text-center",
              headerSubtitle: "text-neutral-500 text-xs text-center",
              formButtonPrimary: "bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm py-2 rounded-xl transition-all cursor-pointer border-none shadow-sm",
              formFieldLabel: "text-neutral-700 font-semibold text-[11px] uppercase tracking-wide",
              formFieldInput: "rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all",
              footerActionLink: "text-primary-600 hover:text-primary-700 transition-colors font-medium",
            },
            variables: {
              colorPrimary: "#D9603B", // Terracota como cor primária do botão e focos no Clerk
              colorBackground: "#FFFFFF",
              colorForeground: "#1C1A19",
            }
          }}
        />
      </div>
    </main>
  );
}
