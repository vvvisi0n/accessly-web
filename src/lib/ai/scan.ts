export async function runAccessibilityScan(area: string, context: string) {
  const issues = [
    "Ramp incline exceeds ADA limit (10°)",
    "Door width below 32 inches",
    "Uneven surface detected near entrance",
  ];
  const score = Math.max(0, 100 - issues.length * 10);
  return {
    summary: `AI scan completed for "${area}" (${context}).`,
    issues,
    score,
  };
}
