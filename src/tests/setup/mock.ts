import { IEventServiceMock, IBookingServiceMock } from "./mock.interface";

export const createEventServiceMock = (): IEventServiceMock => ({
    initEvent: jest.fn(),
    getStatus: jest.fn(),
});

export const createBookingServiceMock = (): IBookingServiceMock => ({
    bookTicket: jest.fn(),
    cancel: jest.fn(),
});
