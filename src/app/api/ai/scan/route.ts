import { runAccessibilityScan } from "@/lib/ai/scan";

export async function POST(req: Request) {
  const { area, context } = await req.json();
  const result = await runAccessibilityScan(area, context);
  return Response.json(result);
}
