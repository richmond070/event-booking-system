export type BookingRecord = {
  userId: string;
  status: "BOOKED" | "CANCELLED" | 'WAITLISTED';
  timestamp: number;
};

export interface IBooking {
  addBooking(eventId: string, booking: BookingRecord): void;

  cancelBooking(eventId: string, userId: string): void;

  getBooking(eventId: string, userId: string): BookingRecord | undefined;

  getAllBookings(eventId: string): BookingRecord[];

  clear(): void;
}
