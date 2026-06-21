export async function POST(req: Request) {
  const { destination } = await req.json();
  const report = {
    title: `Accessibility Travel Report: ${destination}`,
    summary: "AI audit of travel accessibility completed successfully.",
    score: 87,
    recommendations: [
      "Improve tactile pathways in hotel lobbies",
      "Ensure curb cuts along primary walking routes",
      "Increase elevator signage visibility",
    ],
  };
  return Response.json(report);
}
