import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { provider } from './index';

jest.mock('@libs/services-lib/public');
jest.mock('@libs/services-lib/households/entity');
jest.mock('@libs/services-lib/tenantSettings/entity');
jest.mock('@libs/services-lib/assessment-response/entity');
jest.mock('@libs/services-lib/assessment-form/entity');

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

  it('should instantiate AssessmentFormsService', () => {
    provider();
    expect(AssessmentFormsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate AssessmentResponsesService', () => {
    provider();
    expect(AssessmentResponsesService.prototype.constructor).toBeCalled();
  });
});
