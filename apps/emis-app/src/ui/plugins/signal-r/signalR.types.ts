export interface ISignalR {
  buildHubConnection(): void;
  addSubscription(id: uuid): void;
  unsubscribeAll(): Promise<void>;
  updateSubscriptions(): Promise<void>;
}

export interface ISignalRMock {
  instance: {
    buildHubConnection(): jest.Mock<void>;
    addSubscription(id: uuid): jest.Mock<void>;
    unsubscribeAll(): jest.Mock<Promise<void>>;
    updateSubscriptions(): jest.Mock<Promise<void>>;
  }
}
