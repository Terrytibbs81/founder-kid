const KV_URL = process.env.KV_REST_API_URL!;
const KV_TOKEN = process.env.KV_REST_API_TOKEN!;

async function kvRequest(method: string, path: string, rawBody?: string) {
  const res = await fetch(`${KV_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: rawBody,
  });
  return res.json();
}

export async function kvGet(key: string) {
  const data = await kvRequest("GET", `/get/${key}`);
  return data.result ? JSON.parse(data.result) : null;
}

export async function kvSet(key: string, value: unknown) {
  await kvRequest("POST", `/set/${key}`, JSON.stringify(value));
}
