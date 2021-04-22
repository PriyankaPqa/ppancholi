import { EventsService } from '@crctech/registration-lib/src/services/events';
import { BeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { provider } from './index';

jest.mock('@crctech/registration-lib/src/services/events');
jest.mock('@crctech/registration-lib/src/services/beneficiaries');

describe('Provider', () => {
  it('should instantiate EventsService', () => {
    provider();
    expect(EventsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate BeneficiariesService', () => {
    provider();
    expect(BeneficiariesService.prototype.constructor).toBeCalled();
  });
});
