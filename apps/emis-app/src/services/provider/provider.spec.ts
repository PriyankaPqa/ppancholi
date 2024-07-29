import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { MassActionService } from '@libs/services-lib/mass-actions/entity';
import { EventsService } from '@libs/services-lib/events/entity';
import { UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { CaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { NotificationsService } from '@libs/services-lib/notifications/entity';
import { BookingRequestsService } from '@libs/services-lib/booking-requests';

import { provider } from './index';

jest.mock('@libs/services-lib/user-accounts/entity');
jest.mock('@libs/services-lib/events/entity');
jest.mock('@libs/services-lib/case-files/entity');
jest.mock('@libs/services-lib/booking-requests');
jest.mock('@libs/services-lib/events/entity');
jest.mock('@libs/services-lib/optionItems');
jest.mock('@libs/services-lib/teams/entity');
jest.mock('@libs/services-lib/programs/entity');
jest.mock('@libs/services-lib/public');
jest.mock('@libs/services-lib/households/entity');
jest.mock('@libs/services-lib/financial-assistance-tables/entity');
jest.mock('@libs/services-lib/mass-actions/entity');
jest.mock('@libs/services-lib/case-files/metadata');

jest.mock('@libs/services-lib/approval-tables/entity');
jest.mock('@libs/services-lib/assessment-response/entity');
jest.mock('@libs/services-lib/assessment-form/entity');
jest.mock('@libs/services-lib/notifications/entity');

describe('Provider', () => {
  it('should instantiate UserAccountsService', () => {
    provider();
    expect(UserAccountsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseFilesService', () => {
    provider();
    expect(CaseFilesService.prototype.constructor).toBeCalled();
  });

  it('should instantiate BookingRequestService', () => {
    provider();
    expect(BookingRequestsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate EventsService', () => {
    provider();
    expect(EventsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate OptionItemsService', () => {
    provider();
    expect(OptionItemsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate TeamsService', () => {
    provider();
    expect(TeamsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate ProgramsService', () => {
    provider();
    expect(ProgramsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate PublicService', () => {
    provider();
    expect(PublicService.prototype.constructor).toBeCalled();
  });

  it('should instantiate HouseholdsService', () => {
    provider();
    expect(HouseholdsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate FinancialAssistanceTablesService', () => {
    provider();
    expect(FinancialAssistanceTablesService.prototype.constructor).toBeCalled();
  });

  it('should instantiate UserAccountsService', () => {
    provider();
    expect(UserAccountsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate MassActionService', () => {
    provider();
    expect(MassActionService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseFilesMetadataService', () => {
    provider();
    expect(CaseFilesMetadataService.prototype.constructor).toBeCalled();
  });

  it('should instantiate ApprovalsService', () => {
    provider();
    expect(ApprovalTablesService.prototype.constructor).toBeCalled();
  });

  it('should instantiate AssessmentFormsService', () => {
    provider();
    expect(AssessmentFormsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate AssessmentResponsesService', () => {
    provider();
    expect(AssessmentResponsesService.prototype.constructor).toBeCalled();
  });

  it('should instantiate NotificationsService', () => {
    provider();
    expect(NotificationsService.prototype.constructor).toBeCalled();
  });
});
