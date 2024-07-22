import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { ReferralsHomePage } from '../../../pages/referrals/referralsHome.page';
import { fixtureAddReferralData } from '../../../fixtures/referrals';

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

describe('[T28432] Add Referral to a Case File (default).', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
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
            const resultCreateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            cy.login(roleName);
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/referrals`);
          });
        });

        it('should be able to add referral to a case file', () => {
          const referralData = fixtureAddReferralData();
          const referralsHomePage = new ReferralsHomePage();

          const addNewReferralPage = referralsHomePage.addReferral();
          addNewReferralPage.addReferralOrganizationName(referralData.name);
          addNewReferralPage.referralType(referralData.type);
          addNewReferralPage.addReferralNotes(referralData.note);

          const referralDetailsPage = addNewReferralPage.addReferral();
          cy.contains('The referral has been successfully created').should('be.visible');
          referralDetailsPage.getReferralOrganizationNameElement().contains(referralData.name).should('be.visible');
          referralDetailsPage.getEditReferralButton().should('be.visible');
          referralDetailsPage.getReferralType().should('string', referralData.type);
          referralDetailsPage.getReferralNotes().should('string', referralData.note);
          referralDetailsPage.getReferralMethod().should('string', referralData.method);
          referralDetailsPage.getBackToReferralButton().should('be.visible');

          const caseFileDetailsPage = referralDetailsPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`Referral name: ${referralData.name}`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Added referral');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', `Referral name: ${referralData.name}`);
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    before(() => {
      cy.getToken().then(async (tokenResponse) => {
        accessTokenL6 = tokenResponse.access_token;
        const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
        const resultCreateHousehold = await prepareStateHousehold(accessTokenL6, resultCreatedEvent.event);
        cy.wrap(resultCreatedEvent.provider).as('provider');
        cy.wrap(resultCreatedEvent.event).as('event');
        cy.wrap(resultCreatedEvent.team).as('teamCreated');
        cy.wrap(resultCreateHousehold.registrationResponse.caseFile.id).as('caseFileId');
      });
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}/referrals`);
        });
        it('should not be able to add referral to a case file', () => {
          if (roleName === UserRoles.level0) {
            cy.contains('You do not have permission to access this page').should('be.visible');
          } else if (roleName === UserRoles.contributor1 || roleName === UserRoles.contributor2 || roleName === UserRoles.contributor3 || roleName === UserRoles.readonly) {
            const referralsHomePage = new ReferralsHomePage();
            referralsHomePage.getTableTitleElement().contains('Referrals').should('be.visible');
            referralsHomePage.getAddReferralButton().should('not.exist');
          }
        });
      });
    }
  });
});
