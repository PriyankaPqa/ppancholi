import { IProvider } from '@/services/provider';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes, IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria } from '@libs/entities-lib/program';
import { IdentityAuthenticationMethod, IdentityAuthenticationStatus, IIdentityAuthentication } from '@libs/entities-lib/case-file';
import { verifyAndReturnAddFaPaymentPage } from '../../helpers/page';
import { createEventAndTeam, createProgramWithTableWithItemAndSubItem, prepareStateHousehold, updateAuthenticationOfIdentity } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { useProvider } from '../../../provider/provider';

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

describe('[T28267] Cannot create manual FA payment when Case File Authentication status check failed', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const eligibilityCriteria: IEligibilityCriteria = {
        authenticated: true,
        impacted: false,
        completedAssessments: false,
        completedAssessmentIds: [],
      };
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(
        resultCreatedEvent.provider,
        resultCreatedEvent.event.id,
        EFinancialAmountModes.Fixed,
        { eligibilityCriteria },
      );
      const resultHousehold = await prepareStateHousehold(accessTokenL6, resultCreatedEvent.event);
      const params: IIdentityAuthentication = {
        identificationIds: [],
        method: IdentityAuthenticationMethod.NotApplicable,
        status: IdentityAuthenticationStatus.Failed,
      };
      await updateAuthenticationOfIdentity(resultCreatedEvent.provider, resultHousehold.registrationResponse.caseFile.id, params);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
      cy.wrap(accessTokenL6).as('accessTokenL6');
      cy.wrap(resultCreateProgram.table).as('faTable');
      cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
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
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}`);
        });

        it('should not be able to manually create financial assistance payment when case file has authentication status check failed.', function () {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getIdentityIconColorValidationElement().should('have.attr', 'class').and('contains', 'validation-button-error');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();
          cy.waitForStatusCode('**/household/potential-duplicates/*/duplicates', 200, 45000); // addFaPayment Button activates after this GET request has status code 200, an improvement over using static wait

          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          cy.callSearchUntilMeetCondition({
            provider: useProvider(this.accessTokenL6),
            searchCallBack: (provider: IProvider) => (provider.financialAssistanceTables.search({
              filter: { Entity: { EventId: { value: this.event.id, type: 'guid' } } },
            })),
            conditionCallBack: (value: IFinancialAssistanceTableEntity[]) => value.length > 0,
          });

          financialAssistanceHomePage.addNewFaPayment();

          const addFinancialAssistancePage = verifyAndReturnAddFaPaymentPage();
          addFinancialAssistancePage.selectTable(this.faTable.name.translation.en);
          // eslint-disable-next-line
          cy.contains('The household does not meet one or more eligibility criteria for the selected program. Please review the eligibility criteria for this program and try again.').should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
        });
        it('should not be able to access add fa payment button', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.getSearchField().should('be.visible');
          financialAssistanceHomePage.getAddFaPaymentButton().should('not.exist');
        });
      });
    }
  });
});
