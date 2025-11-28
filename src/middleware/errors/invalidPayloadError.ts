export class InvalidPayloadError extends Error {
  public statusCode: number;

  constructor(message = "Invalid request payload") {
    super(message);
    this.statusCode = 400;
    this.name = "InvalidPayloadError";
    Object.setPrototypeOf(this, InvalidPayloadError.prototype);
  }
}
