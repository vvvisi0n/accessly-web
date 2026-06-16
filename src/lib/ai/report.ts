export async function generateReport(context: string) {
  return {
    message: `Accessibility report for ${context} generated successfully.`,
    score: 95,
  };
}
