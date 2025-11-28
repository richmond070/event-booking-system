export class EventNotFoundError extends Error {
  public statusCode: number;

  constructor(message = "Event not found") {
    super(message);
    this.statusCode = 404;
    this.name = "EventNotFoundError";
    Object.setPrototypeOf(this, EventNotFoundError.prototype);
  }
}
