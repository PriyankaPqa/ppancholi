import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { mockAddTagToCaseFileRequest } from '@libs/cypress-lib/mocks/casefiles/casefile';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { caseFileTags } from '../../../pages/casefiles/caseFileDetails.page';

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

describe('[T28266] Cannot create manual FA payment when Case File has an Irregular tag on it', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      await createProgramWithTableWithItemAndSubItem(resultCreatedEvent.provider, resultCreatedEvent.event.id, EFinancialAmountModes.Fixed);
      const resultHouseholdCreated = await prepareStateHousehold(accessTokenL6, resultCreatedEvent.event);
      await resultCreatedEvent.provider.caseFiles.setCaseFileTags(resultHouseholdCreated.registrationResponse.caseFile.id, [mockAddTagToCaseFileRequest(caseFileTags.Irregular)]);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultHouseholdCreated.registrationResponse.caseFile.id).as('caseFileId');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            cy.login(roleName);
            cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
          });
        });

        it('should not be able to create manual FA payment when Case File has an Irregular tag on it', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.addNewFaPayment();
          cy.contains('Error').should('be.visible');
          financialAssistanceHomePage.getErrorMessageElement().contains('Financial assistance cannot be added due to tags').should('be.visible');
          financialAssistanceHomePage.getDialogSubmitButton().should('be.visible');
          financialAssistanceHomePage.getDialogCloseElement().should('be.visible');
        });
      });
    }
  });

  describe('Cannot roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
        });
        it('should not be able to manually create payment with Irregular tag', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          cy.contains('Refresh').should('be.visible');
          financialAssistanceHomePage.getAddFaPaymentButton().should('not.exist');
        });
      });
    }
  });
});
