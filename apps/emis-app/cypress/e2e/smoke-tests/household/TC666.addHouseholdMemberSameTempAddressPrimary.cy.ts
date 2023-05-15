import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { format } from 'date-fns';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { useProvider } from '../../../provider/provider';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { fixtureHouseholdMember } from '../../../fixtures/household';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
};

const cannotRoles = {
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let event = null as IEventEntity;
let accessTokenL6 = '';

const prepareState = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  cy.wrap(mockCreateHousehold).as('household');
  const caseFileCreated = await provider.households.postCrcRegistration(mockCreateHousehold);
  cy.wrap(caseFileCreated.caseFile.householdId).as('householdCreated');
};

const prepareEventTeam = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  cy.wrap(result.team).as('teamCreated');
  cy.wrap(provider).as('provider');
};

const title = '#TC666# - Add Household Member Same Temp Address As Primary';

describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      await prepareEventTeam(accessTokenL6);
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
          // eslint-disable-next-line
          cy.get('@householdCreated').then((householdId) => {
            cy.goTo(`casefile/household/${householdId}`);
          });
        });
        it('should successfully add household member with same temp address as primary', function () {
          const householdSize = this.household.additionalMembers.length + 1; // 1 primary member + additional household members
          const householdMemberData = fixtureHouseholdMember(this.test.retries.length);

          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdSize().should('be.visible').should('have.length', householdSize);

          const addHouseholdMemberPage = householdProfilePage.addNewMember();
          addHouseholdMemberPage.fill(householdMemberData);
          addHouseholdMemberPage.assignSameTempAddressAsPrimaryMember();
          addHouseholdMemberPage.addHouseholdMember();

          householdProfilePage.getHouseholdSize().should('have.length', householdSize + 1);

          if (roleName === 'Level1' || roleName === 'Level0') {
            householdProfilePage.getMakePrimaryButtons().should('not.exist');
            householdProfilePage.getEditMemberButtons().eq(5).should('exist');
            householdProfilePage.getSplitMemberButtons().should('not.exist');
            householdProfilePage.getDeleteMemberButtonByIndex(4).should('exist');
          } else {
            householdProfilePage.getMakePrimaryButtons().eq(4).should('exist');
            householdProfilePage.getEditMemberButtons().eq(5).should('exist');
            householdProfilePage.getSplitMemberButtons().eq(4).should('exist');
            householdProfilePage.getDeleteMemberButtonByIndex(4).should('exist');
          }

          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Modified household information');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Household member added: ${householdMemberData.firstName} ${householdMemberData.lastName}`);
        });
      });
    }
  });

  describe('Cannot roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('casefile');
        });
        it('should not be able to add household member with same temp address as primary', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold(); // re-using a household created for canRoles.
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getAddNewMemberButton().should('not.exist');
        });
      });
    }
  });
});
