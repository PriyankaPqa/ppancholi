import { provider } from './index';
import { EventsService } from '../events';
import { BeneficiariesService } from '../beneficiaries';

jest.mock('../events');
jest.mock('../beneficiaries');

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
