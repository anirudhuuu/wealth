export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && !isNaN(amount);
}

export function validateDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
