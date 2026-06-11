import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-transparent">
      <AppSidebar />
      <div className="lg:pl-72">
        <AppHeader />
        <main className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
