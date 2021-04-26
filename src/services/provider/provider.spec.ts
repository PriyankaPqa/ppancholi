import { PublicService } from '@crctech/registration-lib/src/services/public';
import { BeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { provider } from './index';

jest.mock('@crctech/registration-lib/src/services/public');
jest.mock('@crctech/registration-lib/src/services/beneficiaries');

describe('Provider', () => {
  it('should instantiate PublicService', () => {
    provider();
    expect(PublicService.prototype.constructor).toBeCalled();
  });

  it('should instantiate BeneficiariesService', () => {
    provider();
    expect(BeneficiariesService.prototype.constructor).toBeCalled();
  });
});
