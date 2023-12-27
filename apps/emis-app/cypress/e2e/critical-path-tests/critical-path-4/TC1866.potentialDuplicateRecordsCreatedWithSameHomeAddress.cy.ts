import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { getToday } from '@libs/cypress-lib/helpers';
import { mockCreateDuplicateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { useProvider } from '../../../provider/provider';
import { createHousehold } from '../../helpers/prepareState';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

describe('#TC1866# : SELF REG - Potential duplicate records created when individual enters same home Address as an existing EMIS household', { tags: ['@registration'] }, () => {
  beforeEach(() => {
    cy.then(async () => {
      cy.getToken().then(async (accessToken) => {
        const provider = useProvider(accessToken.access_token);
        const createdEvent = await provider.events.createEvent(mockCreateEvent());
        const createdHousehold = await createHousehold(provider, createdEvent);
        cy.wrap(createdEvent.id).as('eventId');
        cy.wrap(createdEvent.name).as('eventName');
        cy.wrap(createdHousehold.mockCreateHousehold.homeAddress).as('homeAddress');
        cy.wrap(createdHousehold.mockCreateHousehold.primaryBeneficiary.identitySet).as('personalInfo');
        cy.wrap(createdHousehold.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
        cy.wrap(createdHousehold.registrationResponse.household.registrationNumber).as('registrationNumber');
        cy.wrap(createdHousehold.registrationResponse.household.address.address).as('duplicateHouseholdAddress');
        cy.wrap(provider).as('provider');
        cy.login();
      });
    });
  });
  it('should create potential duplicate records when entering same home address', function () {
    cy.then(async () => {
      const createDuplicateHousehold = mockCreateDuplicateHouseholdRequest(this.homeAddress, this.eventId);
      const duplicateHousehold = await this.provider.households.postPublicRegistration(createDuplicateHousehold);
      cy.goTo(`casefile/household/${duplicateHousehold.caseFile.householdId}`);
      const householdProfilePage = new HouseholdProfilePage();
      const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
      manageDuplicatesPage.getDuplicateHouseholdPrimaryMemberName().should('eq', `${this.personalInfo.firstName} ${this.personalInfo.lastName}`);
      manageDuplicatesPage.getDuplicateHouseholdRegistrationNumber().should('eq', `Registration number: ${this.registrationNumber}`);
      manageDuplicatesPage.getDuplicateHouseholdCaseFileData()
        .should('string', `Case file number: ${this.caseFileNumber}`)
        .and('string', `Event: ${this.eventName.translation.en}`);
      manageDuplicatesPage.getDuplicateHouseholdDetails()
        .should(
          'eq',
          `${this.duplicateHouseholdAddress.unitSuite}-${this.duplicateHouseholdAddress.streetAddress}, Quebec, AB, ${this.duplicateHouseholdAddress.postalCode}, Canada`,
        );
      manageDuplicatesPage.getDuplicateHistoryStatus().should('eq', 'Flagged as potential');
      manageDuplicatesPage.getDuplicateHistoryUser().should('string', 'By: System').and('string', getToday());
      manageDuplicatesPage.getDuplicateHistoryRationale().should('eq', 'Rationale: Flagged by the system');
      manageDuplicatesPage.getActionDropdown().should('exist');
      manageDuplicatesPage.goToHouseholdProfilePage();
      const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
      caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('potential duplicate');
      caseFileDetailsPage.getUserName().should('eq', 'System');
      caseFileDetailsPage.getCaseFileActivityTitle(0).should('string', 'Potential duplicate flagged');
      caseFileDetailsPage.getCaseFileActivityBody(0).should('string', `This household has been identified as a potential duplicate with  #${this.registrationNumber}`)
        .and('string', 'Rationale: Flagged by the system');
      caseFileDetailsPage.goToDuplicateHouseholdProfile();
      householdProfilePage.getDuplicatesIcon().should('be.visible');
      householdProfilePage.getDuplicatesCount().should('eq', '1 potential duplicate(s)');
    });
  });
});
