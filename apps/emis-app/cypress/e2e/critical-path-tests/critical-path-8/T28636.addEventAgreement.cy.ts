import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { returnDateInFormat } from '@libs/cypress-lib/helpers';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureEventAgreement } from '../../../fixtures/events';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const cannotRoles = [
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

describe('[T28636] Add Event Agreement', { tags: ['@event'] }, () => {
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
        it('should successfully add event agreement', function () {
          const eventAgreementData = fixtureEventAgreement(this.test.retries.length);

          const eventDetailsPage = new EventDetailsPage();

          const addNewAgreementPage = eventDetailsPage.addNewAgreement();
          addNewAgreementPage.fill(eventAgreementData, roleName);
          addNewAgreementPage.selectFrenchTab();
          addNewAgreementPage.fillFrenchData(eventAgreementData, roleName);
          addNewAgreementPage.addNewAgreement();

          cy.contains(`${eventAgreementData.name.translation.en}${roleName}`);
          eventDetailsPage.getAgreementType().should('string', eventAgreementData.agreementType);
          eventDetailsPage.getAgreementDetails().should('string', eventAgreementData.details.translation.en);
          eventDetailsPage.getAgreementStartDate().should('string', returnDateInFormat(eventAgreementData.startDate.toString(), 'PP'));
          eventDetailsPage.getAgreementEndDate().should('string', returnDateInFormat(eventAgreementData.endDate.toString(), 'PP'));
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
        it('should not be able to add event agreement', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getAddNewAgreementButton().should('not.exist');
        });
      });
    }
  });
});
