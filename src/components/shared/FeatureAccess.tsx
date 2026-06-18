import type { ReactNode } from "react";
import { hasFeature } from "@/config/features";
import type { Plan, Feature } from "@/config/features";

export default function FeatureAccess({
  plan,
  feature,
  children,
}: {
  plan: Plan;
  feature: Feature;
  children: ReactNode;
}) {
  if (!hasFeature(plan, feature)) return null;
  return <>{children}</>;
}
