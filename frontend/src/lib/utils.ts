// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatMessageTime(date: any) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
