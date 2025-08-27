export class Money {
  readonly amount: number

  constructor(amount: number) {
    this.amount = amount
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount)
  }

  toNumber(): number {
    return this.amount
  }
}
