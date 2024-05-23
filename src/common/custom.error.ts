export class CustomError extends Error {
  constructor(
    public statusCode: number,
    public publicMessage?: string,
    message?: string,
  ) {
    super(message);
    this.publicMessage = publicMessage;
  }
}
