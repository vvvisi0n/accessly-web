import { useSession } from "next-auth/react";
import ProDashboard from "@/components/pro/ProDashboard";
import FreeDashboard from "@/components/FreeDashboard";

import ChatUI from "@/components/chat/ChatUI";

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Accessly AI Companion</h1>
      <ChatUI />
    </main>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const plan = session?.user?.plan || "free";

  if (plan === "pro") return <ProDashboard />;
  return <FreeDashboard />;
}
