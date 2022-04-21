import { ISignalRMock } from './signalR.types';

export const mockSignalR = (): ISignalRMock => ({
  instance: {
    buildHubConnection: jest.fn(),
    addSubscription: jest.fn(),
    unsubscribeAll: jest.fn(),
    updateSubscriptions: jest.fn(),
  },
});
