export async function POST(req: Request) {
  const { city } = await req.json();
  const hotels = [
    { name: "Grand Horizon", rating: 4.5, accessibleRooms: true },
    { name: "Seaside Inn", rating: 4.2, accessibleEntrance: true },
    { name: "ComfortStay", rating: 4.0, accessibleBathrooms: true },
  ];
  return Response.json({ city, hotels });
}
