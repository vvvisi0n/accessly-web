export async function POST(req: Request) {
  const { context } = await req.json();
  const mockData = [
    { area: "Entrance", score: 82, issues: ["Ramp slope", "Signage missing"] },
    { area: "Restroom", score: 67, issues: ["Door clearance", "Mirror height"] },
    { area: "Hallway", score: 90, issues: ["Tactile sign placement"] },
  ];
  return Response.json({ context, analytics: mockData });
}
