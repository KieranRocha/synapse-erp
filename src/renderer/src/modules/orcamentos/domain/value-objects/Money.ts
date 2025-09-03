export type Money = number & { readonly __brand: unique symbol };

export function createMoney(value: number): Money {
  if (value < 0) {
    throw new Error('Money cannot be negative');
  }
  return value as Money;
}
