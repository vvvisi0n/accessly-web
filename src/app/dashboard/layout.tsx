import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside className="w-60 bg-gray-100 p-4">
        <nav className="space-y-2">
          <Link href="/dashboard" className="block hover:text-blue-600">
            🏠 Overview
          </Link>
          <Link href="/dashboard/insights" className="block hover:text-blue-600">
            📊 Insights
          </Link>
          {/* 👇 ADD IT HERE */}
          <Link href="/dashboard/heatmap" className="block hover:text-blue-600">
            🗺️ Accessibility Heatmap
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
