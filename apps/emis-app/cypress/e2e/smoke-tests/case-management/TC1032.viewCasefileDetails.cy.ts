import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allCanRolesValues = [...Object.values(canRoles)];

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

const prepareEventwithTeamWithUsers = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allCanRolesValues);
  event = result.event;
  const { team } = result;
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
};

const title = '#TC1032# - View Case File Details';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      await prepareEventwithTeamWithUsers(accessTokenL6);
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allCanRolesValues);
    }
  });
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}`);
        });
        it('should successfully view case file details', function () {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          // eslint-disable-next-line
          caseFileDetailsPage.getPrimaryBeneficiaryName().should('eq', `${this.household.primaryBeneficiary.identitySet.firstName} ${this.household.primaryBeneficiary.identitySet.lastName}`);
          caseFileDetailsPage.getCaseFileNumber().should('eq', caseFile.caseFileNumber);
          caseFileDetailsPage.getEventName().should('eq', event.name.translation.en);
        });
      });
    }
  });
});
