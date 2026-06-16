import SpaceDesigner from "./SpaceDesigner";
import SignageStudio from "./SignageStudio";
import AnalyticsOverview from "./AnalyticsOverview";

export default function ProDashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Accessly Pro Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">AI Tools</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <SpaceDesigner />
          <SignageStudio />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Analytics</h2>
        <AnalyticsOverview />
      </section>
    </div>
  );
}
