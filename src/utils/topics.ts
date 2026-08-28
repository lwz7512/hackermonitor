export function titleMatchesTopic(title: string, topic: string): boolean {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/);
  return words.includes(topic);
}
