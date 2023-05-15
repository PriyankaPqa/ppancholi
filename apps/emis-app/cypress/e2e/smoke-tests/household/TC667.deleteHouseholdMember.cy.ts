  /* eslint-disable max-nested-callbacks */
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { IEventEntity } from '@libs/entities-lib/event';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { format } from 'date-fns';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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
let caseFile = null as ICaseFileEntity;
let accessTokenL6 = '';

const prepareState = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  cy.wrap(mockCreateHousehold).as('household');
  const caseFileCreated = await provider.households.postCrcRegistration(mockCreateHousehold);
  caseFile = caseFileCreated.caseFile;
};

const prepareEventTeam = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  cy.wrap(result.team).as('teamCreated');
  cy.wrap(provider).as('provider');
};

const title = '#TC667# - Delete Household Member';

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
          cy.goTo(`casefile/household/${caseFile.householdId}`);
        });
        it('should successfully delete a household member', function () {
          const householdSize = this.household.additionalMembers.length + 1;

          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdSize().should('have.length', householdSize);
          householdProfilePage.getFullNameOfMemberByIndex(1).as('memberToDelete');
          cy.get('@memberToDelete').then((memberName) => {
            householdProfilePage.getHouseholdMember(memberName.toString()).should('be.visible');
          });
          householdProfilePage.getDeleteMemberButtonByIndex(0).click();
          cy.contains('Are you sure you want to delete this household member?').should('be.visible');
          householdProfilePage.getDialogCancelDeleteButton().should('be.visible').click();
          householdProfilePage.getDialogCancelDeleteButton().should('not.be.visible');

          householdProfilePage.getDeleteMemberButtonByIndex(0).click();
          householdProfilePage.getDialogConfirmDeleteButton().should('be.visible').click();
          cy.contains('Member was successfully removed').should('be.visible');
          cy.get('@memberToDelete').then((memberName) => {
            householdProfilePage.getHouseholdMember(memberName.toString()).should('not.exist');
          });
          householdProfilePage.getHouseholdSize().should('have.length', householdSize - 1); // confirms that member is deleted.

          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Modified household information');
          cy.get('@memberToDelete').then((memberName) => {
            caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Household member removed: ${memberName}`);
          });
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
        it('should not be able to delete a household member', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold(); // re-using a household created for canRoles.
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getDeleteMemberButtons().should('not.exist');
        });
      });
    }
  });
});
