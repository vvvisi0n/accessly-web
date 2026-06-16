import { features } from "@/config/features";

function FeatureAccess({ plan, feature, children }) {
  if (!features[plan]?.includes(feature)) return null;
  return <>{children}</>;
}

// Usage
<FeatureAccess plan={userPlan} feature="spaceDesigner">
  <SpaceDesigner />
</FeatureAccess>
