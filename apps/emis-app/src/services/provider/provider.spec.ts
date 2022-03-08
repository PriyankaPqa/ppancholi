import { PublicService } from '@libs/registration-lib/services/public';
import { HouseholdsService } from '@libs/registration-lib/services/households/entity';
import { MassActionService } from '@/services/mass-actions/entity';
import { provider } from './index';
import { EventsService } from '../events/entity';
import { UserAccountsService } from '../user-accounts/entity';
import { AppUsersService } from '../app-users';
import { CaseFilesService } from '../case-files/entity';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams/entity';
import { ProgramsService } from '../programs/entity';
import { FinancialAssistanceTablesService } from '../financial-assistance-tables/entity';
import { FinancialAssistanceCategoriesService } from '../financial-assistance-categories/entity';
import { CaseFilesMetadataService } from '../case-files/metadata';
import { CaseNotesMetadataService } from '../case-notes/metadata';
import { CaseFileReferralsMetadataService } from '../case-file-referrals/metadata';
import { CaseFileDocumentsMetadataService } from '../case-file-documents/metadata';
import { EventsMetadataService } from '../events/metadata';
import { FinancialAssistancePaymentsMetadataService } from '../financial-assistance-payments/metadata';

jest.mock('../user-accounts/entity');
jest.mock('../events/entity');
jest.mock('../app-users');
jest.mock('../case-files/entity');
jest.mock('../events/entity');
jest.mock('../optionItems');
jest.mock('../teams/entity');
jest.mock('../programs/entity');
jest.mock('@libs/registration-lib/services/public');
jest.mock('@libs/registration-lib/services/households/entity');
jest.mock('../user-accounts/entity');
jest.mock('../financial-assistance-tables/entity');
jest.mock('../financial-assistance-categories/entity');
jest.mock('../mass-actions/entity');
jest.mock('../case-files/metadata');
jest.mock('../case-notes/metadata');
jest.mock('../case-file-referrals/metadata');
jest.mock('../case-file-documents/metadata');
jest.mock('../events/metadata');
jest.mock('../financial-assistance-payments/metadata');

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
