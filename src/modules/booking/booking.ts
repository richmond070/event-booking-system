import { IBooking, BookingRecord } from "./booking.interface";

export class Booking implements IBooking {
  private bookingsByEvent: Map<string, Map<string, BookingRecord>> = new Map();
    /**
     * create booking
     */
  addBooking(eventId: string, booking: BookingRecord): void {
    if (!this.bookingsByEvent.has(eventId)) {
      this.bookingsByEvent.set(eventId, new Map());
    }

    this.bookingsByEvent.get(eventId)!.set(booking.userId, booking);
  }

  /**
   * cancel booking
   */
  cancelBooking(eventId: string, userId: string): void {
    const eventBookings = this.bookingsByEvent.get(eventId);
    if (!eventBookings) throw new Error(`No bookings for event ${eventId}`);

    const booking = eventBookings.get(userId);
    if (!booking) throw new Error(`Booking for user ${userId} not found`);

    booking.status = "BOOKED";
  }

  /**
   * get single booking by a user 
   */
  getBooking(eventId: string, userId: string): BookingRecord | undefined {
    return this.bookingsByEvent.get(eventId)?.get(userId);
  }

  /**
   * get all bookings
   */
  getAllBookings(eventId: string): BookingRecord[] {
    const eventBookings = this.bookingsByEvent.get(eventId);
    return eventBookings ? Array.from(eventBookings.values()) : [];
  }

  clear(): void {
    this.bookingsByEvent.clear();
  }
}
