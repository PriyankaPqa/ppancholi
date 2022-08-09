import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { MassActionService } from '@libs/services-lib/mass-actions/entity';
import { EventsService } from '@libs/services-lib/events/entity';
import { UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { AppUsersService } from '@libs/services-lib/app-users';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { FinancialAssistanceCategoriesService } from '@libs/services-lib/financial-assistance-categories/entity';
import { CaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';
import { CaseNotesMetadataService } from '@libs/services-lib/case-notes/metadata';
import { CaseFileReferralsMetadataService } from '@libs/services-lib/case-file-referrals/metadata';
import { CaseFileDocumentsMetadataService } from '@libs/services-lib/case-file-documents/metadata';
import { EventsMetadataService } from '@libs/services-lib/events/metadata';
import { FinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';
import { provider } from './index';

jest.mock('@libs/services-lib/user-accounts/entity');
jest.mock('@libs/services-lib/events/entity');
jest.mock('@libs/services-lib/app-users');
jest.mock('@libs/services-lib/case-files/entity');
jest.mock('@libs/services-lib/events/entity');
jest.mock('@libs/services-lib/optionItems');
jest.mock('@libs/services-lib/teams/entity');
jest.mock('@libs/services-lib/programs/entity');
jest.mock('@libs/services-lib/public');
jest.mock('@libs/services-lib/households/entity');
jest.mock('@libs/services-lib/financial-assistance-tables/entity');
jest.mock('@libs/services-lib/financial-assistance-categories/entity');
jest.mock('@libs/services-lib/mass-actions/entity');
jest.mock('@libs/services-lib/case-files/metadata');
jest.mock('@libs/services-lib/case-notes/metadata');
jest.mock('@libs/services-lib/case-file-referrals/metadata');
jest.mock('@libs/services-lib/case-file-documents/metadata');
jest.mock('@libs/services-lib/events/metadata');
jest.mock('@libs/services-lib/financial-assistance-payments/metadata');

describe('Provider', () => {
  it('should instantiate AppUsersService', () => {
    provider();
    expect(AppUsersService.prototype.constructor).toBeCalled();
  });

  it('should instantiate UserAccountsService', () => {
    provider();
    expect(UserAccountsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseFilesService', () => {
    provider();
    expect(CaseFilesService.prototype.constructor).toBeCalled();
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

  it('should instantiate FinancialAssistanceCategoriesService', () => {
    provider();
    expect(FinancialAssistanceCategoriesService.prototype.constructor).toBeCalled();
  });

  it('should instantiate MassActionService', () => {
    provider();
    expect(MassActionService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseFilesMetadataService', () => {
    provider();
    expect(CaseFilesMetadataService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseNotesMetadataService', () => {
    provider();
    expect(CaseNotesMetadataService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseFileReferralsMetadataService', () => {
    provider();
    expect(CaseFileReferralsMetadataService.prototype.constructor).toBeCalled();
  });

  it('should instantiate CaseFileDocumentsMetadataService', () => {
    provider();
    expect(CaseFileDocumentsMetadataService.prototype.constructor).toBeCalled();
  });

  it('should instantiate EventsMetadataService', () => {
    provider();
    expect(EventsMetadataService.prototype.constructor).toBeCalled();
  });

  it('should instantiate FinancialAssistancePaymentsMetadataService', () => {
    provider();
    expect(FinancialAssistancePaymentsMetadataService.prototype.constructor).toBeCalled();
  });
});
