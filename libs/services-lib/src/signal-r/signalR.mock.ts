import { ISignalRServiceMock } from './signalR.types';

export const mockSignalRService = (): ISignalRServiceMock => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  unsubscribeAll: jest.fn(),
});
