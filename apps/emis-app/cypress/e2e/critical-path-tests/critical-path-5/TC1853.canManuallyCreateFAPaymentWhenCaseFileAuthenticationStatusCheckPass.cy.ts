import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IIdentityAuthentication, IdentityAuthenticationMethod, IdentityAuthenticationStatus } from '@libs/entities-lib/case-file';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IEligibilityCriteria } from '@libs/entities-lib/program';
import { identificationIdProvided } from '@libs/cypress-lib/helpers/optionLists';
import { fixturePrepaidCardPaymentLine } from '../../../fixtures/financial-assistance';
import {
  createProgramWithTableWithItemAndSubItem,
  createEventAndTeam,
  prepareStateHousehold,
  updateAuthenticationOfIdentity,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('#TC1853# -Can create manual FA payment when Case File Authentication status check passes', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const eligibilityCriteria: IEligibilityCriteria = {
        authenticated: true,
        impacted: false,
        completedAssessments: false,
        completedAssessmentIds: [],
      };
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(
        resultPrepareStateEvent.provider,
        resultPrepareStateEvent.event.id,
        EFinancialAmountModes.Fixed,
        { eligibilityCriteria },
      );
      cy.wrap(resultPrepareStateEvent.provider).as('provider');
      cy.wrap(resultPrepareStateEvent.event).as('eventCreated');
      cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
      cy.wrap(resultCreateProgram.table).as('faTable');
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            const params: IIdentityAuthentication = {
              identificationIds: [{
                optionItemId: identificationIdProvided.CanadianCitizenshipCard,
                specifiedOther: null,
              }],
              method: IdentityAuthenticationMethod.InPerson,
              status: IdentityAuthenticationStatus.Passed,
            };
            await updateAuthenticationOfIdentity(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, params);
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/financialAssistance/create`);
          });
        });
        it('should be able to manually create financial assistance payment when case file has authentication status check passes', function () {
          const paymentLineData = fixturePrepaidCardPaymentLine();

          const addFinancialAssistancePage = new AddFinancialAssistancePage();
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
          addFinancialAssistancePage.getCreateButton().should('be.disabled');
          addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
          addFinancialAssistancePage.selectTable(this.faTable.name.translation.en);
          addFinancialAssistancePage.fillDescription('Financial Description Payment');
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
          addFinancialAssistancePage.getCreateButton().should('be.disabled');
          addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');

          const addNewPaymentLinePage = addFinancialAssistancePage.goToAddNewPaymentLinePage();
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
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
          addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
          addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHouseholdCreated = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        cy.wrap(resultHouseholdCreated.registrationResponse.caseFile.id).as('caseFileId');
      });
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            cy.login(roleName);
            cy.goTo(`casefile/${this.caseFileId}/financialAssistance/create`);
          });
        });
        it('should not be able to manually create financial assistance payment', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
