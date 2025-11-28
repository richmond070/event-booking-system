export class BookingNotFoundError extends Error {
  public statusCode: number;

  constructor(message = "Booking not found") {
    super(message);
    this.statusCode = 404;
    this.name = "BookingNotFoundError";
    Object.setPrototypeOf(this, BookingNotFoundError.prototype);
  }
}
