export class NoTicketAvailableError extends Error {
  public statusCode: number;

  constructor(message = "No tickets available for this event") {
    super(message);
    this.statusCode = 400;
    this.name = "NoTicketAvailableError";
    Object.setPrototypeOf(this, NoTicketAvailableError.prototype);
  }
}
