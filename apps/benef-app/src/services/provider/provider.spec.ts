/**
 * @group services
 */

import { PublicService } from '@libs/registration-lib/services/public';
import { HouseholdsService } from '@libs/registration-lib/services/households/entity';
import { TenantSettingsService } from '@libs/registration-lib/services/tenantSettings/entity';
import { provider } from './index';

jest.mock('@libs/registration-lib/services/public');
jest.mock('@libs/registration-lib/services/households/entity');
jest.mock('@libs/registration-lib/services/tenantSettings/entity');

describe('Provider', () => {
  it('should instantiate PublicService', () => {
    provider();
    expect(PublicService.prototype.constructor).toBeCalled();
  });

  it('should instantiate HouseholdsService', () => {
    provider();
    expect(HouseholdsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate TenantSettingsService', () => {
    provider();
    expect(TenantSettingsService.prototype.constructor).toBeCalled();
  });
});
