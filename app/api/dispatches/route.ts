import { NextResponse } from "next/server";
import { kvGet, kvSet } from "../../../lib/kv";

export async function GET() {
  const dispatches = (await kvGet("dispatches")) || [];
  return NextResponse.json(dispatches);
}

export async function POST(request: Request) {
  const { title, body } = await request.json();
  const dispatches = (await kvGet("dispatches")) || [];
  const newDispatch = {
    id: Date.now().toString(),
    title,
    body,
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
  dispatches.push(newDispatch);
  await kvSet("dispatches", dispatches);
  return NextResponse.json({ success: true, dispatch: newDispatch });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const dispatches = (await kvGet("dispatches")) || [];
  await kvSet(
    "dispatches",
    dispatches.filter((d: { id: string }) => d.id !== id)
  );
  return NextResponse.json({ success: true });
}
