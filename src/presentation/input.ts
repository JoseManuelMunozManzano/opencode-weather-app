export function ask(question: string): string {
  const answer = prompt(question);
  return answer?.trim() ?? "";
}

export function toZeroBasedIndex(choice: string): number {
  return Number(choice) - 1;
}

export function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
