export async function POST(req: Request) {
  const { start, end } = await req.json();
  const directions = [
    { step: "Use accessible subway line A", duration: "12 min" },
    { step: "Exit at Elevator Stop C", duration: "2 min" },
    { step: "Take ramp to entrance of destination", duration: "5 min" },
  ];
  return Response.json({ start, end, directions });
}
