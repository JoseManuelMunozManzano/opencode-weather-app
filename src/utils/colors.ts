export const RESET = "\x1b[0m";
export const CYAN = "\x1b[36m";
export const YELLOW = "\x1b[33m";
export const GREEN = "\x1b[32m";
export const RED = "\x1b[31m";

export function cyan(text: string): string {
  return `${CYAN}${text}${RESET}`;
}

export function yellow(text: string): string {
  return `${YELLOW}${text}${RESET}`;
}

export function green(text: string): string {
  return `${GREEN}${text}${RESET}`;
}

export function red(text: string): string {
  return `${RED}${text}${RESET}`;
}
