import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { Language } from '@libs/cypress-lib/helpers';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
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

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

describe('[T28574] Select Consent Statement for Event', { tags: ['@event'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (accessToken) => {
            const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRoles);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('teamCreated');
            cy.login(roleName);
            cy.goTo(`events/${event.id}`);
          });
        });
        afterEach(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully select consent statement for event', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getSelectConsentStatementButton().should('be.visible');

          const selectStatementPage = eventDetailsPage.addStatement();
          selectStatementPage.getConsentStatementEmis().contains('EMIS consent statement').should('be.visible');
          selectStatementPage.getConsentStatementProvincial().contains('Provincial Agreement').should('be.visible');
          selectStatementPage.getSaveButton().should('be.visible');
          selectStatementPage.getCancelButton().should('be.visible');
          selectStatementPage.getDialogCloseButton().should('be.visible');
          selectStatementPage.getEmisConsentStatementButton().contains('Selected').should('be.visible');
          selectStatementPage.getProvincialConsentStatementButton().contains('Select').should('be.visible');
          selectStatementPage.getConsentStatementText().contains('I understand and agree that').should('be.visible');
          selectStatementPage.selectTab(Language.French);
          selectStatementPage.getConsentStatementText().contains('Je comprends et j’accepte ce qui suit').should('be.visible');
          selectStatementPage.getProvincialConsentStatementButton().click();
          selectStatementPage.selectTab(Language.English);
          selectStatementPage.getConsentStatementText().contains('Some text en').should('be.visible');
          selectStatementPage.selectTab(Language.French);
          selectStatementPage.getConsentStatementText().contains('Some text fr').should('be.visible');
          selectStatementPage.getSaveButton().click();
          selectStatementPage.getCancelButton().should('not.exist'); // confirms dialog is closed

          eventDetailsPage.getConsentStatementDetails().should('eq', 'Provincial Agreement');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    before(() => {
      cy.getToken().then(async (accessToken) => {
        const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRoles);
        cy.wrap(provider).as('provider');
        cy.wrap(event).as('eventCreated');
        cy.wrap(team).as('teamCreated');
      });
    });
    after(function () {
      if (this.provider && this.teamCreated?.id) {
        removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
      }
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}`);
        });
        it('should not be able to select consent statement for event', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getSelectConsentStatementButton().should('not.exist');
        });
      });
    }
  });
});
