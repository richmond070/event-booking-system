export class AlreadyBookedError extends Error {
  public statusCode: number;

  constructor(message = "User has already booked this event") {
    super(message);
    this.statusCode = 400;
    this.name = "AlreadyBookedError";
    Object.setPrototypeOf(this, AlreadyBookedError.prototype);
  }
}
