export class CNPJ {
  readonly value: string

  constructor(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.length !== 14) {
      throw new Error('CNPJ must have 14 digits')
    }
    this.value = digits
  }

  toString(): string {
    return this.value
  }
}
