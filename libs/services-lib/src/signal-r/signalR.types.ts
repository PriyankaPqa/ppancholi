export interface ISignalRService {
  subscribe(connectionId: string, ids: uuid[]): Promise<void>;
  unsubscribe(connectionId: string, ids: uuid[]): Promise<void>;
  unsubscribeAll(connectionId: string): Promise<void>;
}

export interface ISignalRServiceMock {
  subscribe: jest.Mock<null>;
  unsubscribe: jest.Mock<null>;
  unsubscribeAll: jest.Mock<null>;
}
