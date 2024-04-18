import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IEventEntity } from '@libs/entities-lib/event';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = [
   UserRoles.level6,
   UserRoles.level5,
   UserRoles.level4,
   UserRoles.level3,
   UserRoles.level2,
   UserRoles.level1,
   UserRoles.level0,
   UserRoles.contributor1,
   UserRoles.contributor2,
   UserRoles.contributor3,
   UserRoles.readonly,
];

const { filteredCanRoles, allRoles } = getRoles(canRoles, []);

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;
let household = null as ICreateHouseholdRequest;

describe('#TC1032# - View Case File Details', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRoles);
      const { provider, team } = result;
      event = result.event;
      cy.wrap(provider).as('provider');
      cy.wrap(team).as('teamCreated');
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
          cy.then(async () => {
            const result = await prepareStateHousehold(accessTokenL6, event);
            caseFileCreated = result.registrationResponse.caseFile;
            household = result.mockCreateHousehold;
            cy.wrap(household).as('household');
            cy.wrap(caseFileCreated).as('caseFileCreated');
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileCreated.id}`);
          });
        });
        it('should successfully view case file details', function () {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          cy.waitForStatusCode('**/household/potential-duplicates/*/potential-duplicates-count', 200, 10000);
          // eslint-disable-next-line
          caseFileDetailsPage.getPrimaryBeneficiaryName().should('eq', `${this.household.primaryBeneficiary.identitySet.firstName} ${household.primaryBeneficiary.identitySet.lastName}`);
          caseFileDetailsPage.getCaseFileNumber().should('eq', this.caseFileCreated.caseFileNumber);
          caseFileDetailsPage.getEventName().should('eq', event.name.translation.en);
        });
      });
    }
  });
});
