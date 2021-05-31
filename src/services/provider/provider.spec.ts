import { PublicService } from '@crctech/registration-lib/src/services/public';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households';
import { provider } from './index';

jest.mock('@crctech/registration-lib/src/services/public');
jest.mock('@crctech/registration-lib/src/services/households');

describe('Provider', () => {
  it('should instantiate PublicService', () => {
    provider();
    expect(PublicService.prototype.constructor).toBeCalled();
  });

  it('should instantiate HouseholdsService', () => {
    provider();
    expect(HouseholdsService.prototype.constructor).toBeCalled();
  });
});
