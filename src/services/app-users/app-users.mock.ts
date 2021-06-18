import { mockAppUserData } from '@/entities/app-user';
import {
  IAppUsersServiceMock,
} from './app-users.types';

export const mockAppUsersService = (): IAppUsersServiceMock => ({
  findAppUsers: jest.fn(() => mockAppUserData()),
});
