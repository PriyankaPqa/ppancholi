import { IProviderMock } from './provider.types';
import { mockPublicService } from '../public';
import { mockHouseholdsService } from '../households';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
});
