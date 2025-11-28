// Interfaces describing the methods controllers expect
export interface IEventServiceMock {
    initEvent: jest.Mock<any, any>;
    getStatus: jest.Mock<any, any>;
}

export interface IBookingServiceMock {
    bookTicket: jest.Mock<any, any>;
    cancel: jest.Mock<any, any>;
}
