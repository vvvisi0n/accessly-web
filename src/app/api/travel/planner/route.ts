export async function POST(req: Request) {
  const { destination } = await req.json();

  const itinerary = [
    `Hotel: Accessible Suites in ${destination}`,
    `Restaurants with ramp access near city center`,
    `Accessible attractions and museums in ${destination}`,
    `AI optimized travel routes for wheelchair users`,
    `Airport accessibility guide for ${destination}`,
  ];

  return Response.json({
    destination,
    itinerary,
    notes: "Generated using Accessana AI Core and Travel Data API",
  });
}
