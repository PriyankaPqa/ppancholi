import { mockSearchEventsData } from '../../entities/event';
import { IPublicServiceMock } from './public.types';

export const mockPublicService = (): IPublicServiceMock => ({
  searchEvents: jest.fn(() => mockSearchEventsData()),
});
