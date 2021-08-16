import { PublicService } from '@crctech/registration-lib/src/services/public';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { provider } from './index';
import { EventsService } from '../events/entity';
import { UserAccountsService } from '../user-accounts/entity';
import { AppUsersService } from '../app-users';
import { CaseFilesService } from '../case-files/entity';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams/entity';
import { ProgramsService } from '../programs';
import { FinancialAssistanceTablesService } from '../financial-assistance-tables/entity';
import { FinancialAssistanceCategoriesService } from '../financial-assistance-categories/entity';

jest.mock('../user-accounts/entity');
jest.mock('../events/entity');
jest.mock('../app-users');
jest.mock('../case-files/entity');
jest.mock('../events/entity');
jest.mock('../optionItems');
jest.mock('../teams/entity');
jest.mock('../programs');
jest.mock('@crctech/registration-lib/src/services/public');
jest.mock('@crctech/registration-lib/src/services/households/entity');
jest.mock('../user-accounts/entity');
jest.mock('../financial-assistance-tables/entity');
jest.mock('../financial-assistance-categories/entity');

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
});
