export async function runBd(args: string): Promise<{ data: any; raw: string }> {
  const raw = await Bun.$`bd ${args}`.text()
  try {
    return { data: JSON.parse(raw), raw }
  } catch {
    const msg = `bd ${args} failed`
    throw new Error(msg.slice(0, 100))
  }
}

export function formatOutput<T>(
  data: T,
  raw: string,
  format: "markdown" | "json" | "raw",
  template: (data: T) => string
): string {
  if (format === "json") return JSON.stringify(data, null, 2)
  if (format === "raw") return raw
  return template(data)
}