import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { AddFinancialAssistancePage } from 'cypress/pages/financial-assistance-payment/addFinancialAssistance.page';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { fixturePaymentLine } from '../../../fixtures/case-management';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers, createProgramWithTableWithItemAndSubItem } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

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

const prepareState = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  cy.wrap(mockCreateHousehold).as('household');
  const caseFileCreated = await provider.households.postCrcRegistration(mockCreateHousehold);
  caseFile = caseFileCreated.caseFile;
};

const prepareEventwithProgramWithTable = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  const { team } = result;
  const table = await createProgramWithTableWithItemAndSubItem(provider, event.id);
  cy.wrap(event).as('eventCreated');
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
  cy.wrap(table).as('tableCreated');
};

const title = '#TC210# -Create a Pre-paid Card Payment Line';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      await prepareEventwithProgramWithTable(accessTokenL6);
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
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}/financialAssistance/create`);
        });
        it('should successfully create a Prepaid Card Payment Line', function () {
          const paymentLineData = fixturePaymentLine();

          const addFinancialAssistancePage = new AddFinancialAssistancePage();
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
          addFinancialAssistancePage.getCreateButton().should('not.be.enabled');
          addFinancialAssistancePage.selectTable(this.tableCreated.name.translation.en);
          addFinancialAssistancePage.fillDescription('Financial Description Payment');
          addFinancialAssistancePage.getAddPaymentLineButton().click();

          const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
          addNewPaymentLinePage.fill(paymentLineData);
          addNewPaymentLinePage.getAmountValue().should('eq', paymentLineData.amount);
          addNewPaymentLinePage.getRelatedNumberField().should('be.visible');
          addNewPaymentLinePage.fillRelatedNumber(paymentLineData.relatedNumber);
          addNewPaymentLinePage.addNewPaymentLine();

          addFinancialAssistancePage.getPaymentLineGroupTitle().should('eq', 'Prepaid card');
          addFinancialAssistancePage.getItemEditButton().should('be.visible');
          addFinancialAssistancePage.getItemDeleteButton().should('be.visible');
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
          addFinancialAssistancePage.getSubmitAssistanceButton().should('not.be.enabled');
          addFinancialAssistancePage.getCreateButton().click();

          cy.contains('The financial assistance has been successfully created').should('be.visible');
          addFinancialAssistancePage.getPaymentStatus().should('eq', 'New');
          addFinancialAssistancePage.getPaymentEditButton().should('be.visible');
          addFinancialAssistancePage.getPaymentDeleteButton().should('be.visible');
          addFinancialAssistancePage.getPaymentLineItemTitle().should('eq', `${paymentLineData.item} > ${paymentLineData.subItem}`);
          addFinancialAssistancePage.getRelatedNumber().should('string', paymentLineData.relatedNumber);
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
          addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
          addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
        });
        it('should not be able to create a Prepaid Card Payment Line', () => {
          const addFinancialAssistancePage = new AddFinancialAssistancePage();
          addFinancialAssistancePage.getTableSelectField().should('not.exist');
        });
      });
    }
  });
});
