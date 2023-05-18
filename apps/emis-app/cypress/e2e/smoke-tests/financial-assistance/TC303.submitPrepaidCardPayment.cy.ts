import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { mockFinancialAssistancePaymentRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistancePayment';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { FinancialAssistanceHomePage } from 'cypress/pages/financial-assistance-payment/financialAssistanceHome.page';
import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { format } from 'date-fns';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventWithTeamWithUsers, createProgramWithTableWithItemAndSubItem } from '../../helpers/prepareState';
import { useProvider } from '../../../provider/provider';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
};

const cannotRoles = {
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let event = null as IEventEntity;
let caseFile = null as ICaseFileEntity;
let accessTokenL6 = '';
let table = null as IFinancialAssistanceTableEntity;
let financialAssistancePayment = null as IFinancialAssistancePaymentEntity;

const prepareState = async (accessToken: string, event: IEventEntity, table: IFinancialAssistanceTableEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  cy.wrap(mockCreateHousehold).as('household');
  const caseFileCreated = await provider.households.postCrcRegistration(mockCreateHousehold);
  caseFile = caseFileCreated.caseFile;
  const mockFinancialAssistancePayment = mockFinancialAssistancePaymentRequest({ caseFileId: caseFile.id, financialAssistanceTableId: table.id });
  financialAssistancePayment = await provider.financialAssistancePaymentsService.addFinancialAssistancePayment(mockFinancialAssistancePayment);
};

const prepareEventWithProgramWithTable = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  const { team } = result;
  table = await createProgramWithTableWithItemAndSubItem(provider, event.id);
  cy.wrap(event).as('eventCreated');
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
  cy.wrap(table).as('fatable');
};

const title = '#TC303# - Submit a Pre-paid Card Payment';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      await prepareEventWithProgramWithTable(accessTokenL6);
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event, table);
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
        });
        it('should successfully create a Prepaid Card Payment Line', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'New');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(financialAssistancePayment.id);
          financialAssistanceDetailsPage.getAddPaymentLineButton().should('be.enabled');
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().click();
          cy.contains('By clicking Submit your payment will be processed and the status of this financial assistance payment will be Approved.').should('be.visible');
          financialAssistanceDetailsPage.getDialogSubmitFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getDialogCancelFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getDialogSubmitFinancialAssistanceButton().click();
          cy.contains('The financial assistance has been successfully submitted').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'New');
          financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Approved');
          financialAssistanceDetailsPage.goToFinancialAssistanceHomePage();

          financialAssistanceHomePage.getFAPaymentNameById(financialAssistancePayment.id).should('eq', financialAssistancePayment.name);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('eq', 'Prepaid card');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: New');

          const caseFileDetailsPage = financialAssistanceHomePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Name: ${financialAssistancePayment.name}`).and('string', 'Amount: $80.00');
        });
      });
    }
  });

  describe('Cannot roles', () => {
    before(async () => {
      await prepareState(accessTokenL6, event, table);
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
        });
        it('should not be able to create a Prepaid Card Payment Line', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(financialAssistancePayment.id);
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('not.exist');
        });
      });
    }
  });
});
