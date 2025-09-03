export class CNPJ {
  private constructor(private readonly value: string) {}

  static create(value: string): CNPJ {
    const sanitized = value.replace(/\D/g, '');
    if (sanitized.length !== 14) {
      throw new Error('Invalid CNPJ');
    }
    return new CNPJ(sanitized);
  }

  toString(): string {
    return this.value;
  }
}
