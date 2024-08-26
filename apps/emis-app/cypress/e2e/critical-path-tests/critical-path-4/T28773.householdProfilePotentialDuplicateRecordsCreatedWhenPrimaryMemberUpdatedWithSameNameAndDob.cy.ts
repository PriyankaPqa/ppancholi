import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { formatDateToMmmDdYyyy, getToday } from '@libs/cypress-lib/helpers';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { IProvider } from '@/services/provider';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { useProvider } from '../../../provider/provider';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';
import { PrivacyRegistrationMethod } from '../../../pages/registration/crcPrivacyStatement.page';
import { assertPotentialDuplicatesSteps } from './canSteps';
import { ConfirmHouseholdAssociationPage } from '../../../pages/registration/confirmationHouseholdAssociation.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
];

const cannotRoles = [
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

// eslint-disable-next-line
describe('[T28773] CRC REG existing household - Potential duplicate record created when Primary Last Name + First Name + DOB updated to match another member in EMIS', { tags: ['@household'] }, () => {
  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultCreatedPrimaryEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultPrimaryHouseholdPrimaryEvent = await prepareStateHousehold(accessTokenL6, resultCreatedPrimaryEvent.event);
            const resultSecondaryHouseholdPrimaryEvent = await prepareStateHousehold(accessTokenL6, resultCreatedPrimaryEvent.event);
            const resultCreatedSecondaryEvent = await createEventAndTeam(accessTokenL6, allRoles);
            await cy.callSearchUntilMeetCondition({
              provider: useProvider(accessTokenL6),
              searchCallBack: (provider: IProvider) => (provider.households.search({
                filter: { Entity: { RegistrationNumber: resultSecondaryHouseholdPrimaryEvent.registrationResponse.household.registrationNumber } },
                top: 1,
                includeMembers: true,
              })),
              conditionCallBack: (value: IHouseholdEntity[]) => (value.length > 0),
            });
            cy.wrap(resultPrimaryHouseholdPrimaryEvent.mockCreateHousehold.primaryBeneficiary.identitySet).as('primaryHouseholdPrimaryBeneficiary');
            cy.wrap(resultPrimaryHouseholdPrimaryEvent.registrationResponse.household.registrationNumber).as('primaryHouseholdRegistrationNumber');
            cy.wrap(resultSecondaryHouseholdPrimaryEvent.registrationResponse.household.registrationNumber).as('secondaryHouseholdRegistrationNumber');
            cy.wrap(resultPrimaryHouseholdPrimaryEvent.registrationResponse.caseFile.caseFileNumber).as('primaryHouseholdCaseFileNumber');
            cy.wrap(resultSecondaryHouseholdPrimaryEvent.mockCreateHousehold.primaryBeneficiary.identitySet).as('secondaryHouseholdPrimaryBeneficiary');
            cy.wrap(resultCreatedPrimaryEvent.provider).as('provider');
            cy.wrap(resultCreatedPrimaryEvent.team).as('teamCreated');
            cy.wrap(resultCreatedPrimaryEvent.event).as('primaryEventCreated');
            cy.wrap(resultCreatedSecondaryEvent.event).as('secondaryEventCreated');
            cy.login(roleName);
            cy.goTo('registration');
          });
        });
        // eslint-disable-next-line
        it('should create potential duplicate record when primary member updated with same first name, last name and dob', function () {
          const duplicatePrimaryBeneficiaryData: IPersonalInfoFields = {
            firstName: this.primaryHouseholdPrimaryBeneficiary.firstName,
            lastName: this.primaryHouseholdPrimaryBeneficiary.lastName,
            dateOfBirth: this.primaryHouseholdPrimaryBeneficiary.dateOfBirth,
          };

          const crcRegistrationPage = new CrcRegistrationPage();
          crcRegistrationPage.getPageTitle().should('eq', 'Welcome, let\'s get started. Please select an event:');
          crcRegistrationPage.fillEvent(this.secondaryEventCreated.name.translation.en);

          const beneficiarySearchPage = crcRegistrationPage.beginRegistration();
          beneficiarySearchPage.enterRegistrationNumber(this.secondaryHouseholdRegistrationNumber);
          beneficiarySearchPage.searchBeneficiaries();
          beneficiarySearchPage.getDetailsButton().should('be.visible');
          beneficiarySearchPage.getNextButton().should('be.visible');
          beneficiarySearchPage.getBackButton().should('be.visible');

          const associateHouseholdPage = beneficiarySearchPage.goToAssociateHouseholdPage();
          associateHouseholdPage.getExistingBeneficiarySummary()
            .contains(`${this.secondaryHouseholdPrimaryBeneficiary.firstName} ${this.secondaryHouseholdPrimaryBeneficiary.lastName}`)
            .should('be.visible');
          associateHouseholdPage.getExistingBeneficiarySummary().contains(getToday()).should('be.visible');
          associateHouseholdPage.getRegisteredEvent().contains(this.primaryEventCreated.name.translation.en).should('be.visible');
          associateHouseholdPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
          associateHouseholdPage.fillUserNameIfEmpty(roleName);
          associateHouseholdPage.fillPrivacyRegistrationMethod(PrivacyRegistrationMethod.Phone);
          associateHouseholdPage.editPersonalInformation();
          associateHouseholdPage.fill(duplicatePrimaryBeneficiaryData, '');
          cy.contains('This individual appears to already exist in the system. Please confirm this individual is not a duplicate before proceeding.').should('be.visible');
          associateHouseholdPage.savePersonalInformation();
          cy.contains('Personal information has been updated').should('be.visible');
          associateHouseholdPage.getFirstName().should('string', duplicatePrimaryBeneficiaryData.firstName);
          associateHouseholdPage.getLastName().should('string', duplicatePrimaryBeneficiaryData.lastName);
          associateHouseholdPage.getDateOfBirth().should('string', formatDateToMmmDdYyyy(duplicatePrimaryBeneficiaryData.dateOfBirth.toLocaleString()));
          associateHouseholdPage.getNextButton().click();
          cy.contains("Please make sure that the household's information is up to date and verified.").should('be.visible');
          cy.contains('Are you sure you want to associate the household to this event?').should('be.visible');
          associateHouseholdPage.getDialogCancelButton().should('be.visible');
          associateHouseholdPage.getDialogConfirmButton().should('be.visible');
          cy.intercept('POST', '**/orchestration/orchestration-households/case-file').as('potentialDuplicateHousehold'); // begins interception for potential duplicate household being created
          associateHouseholdPage.goToConfirmationHouseholdAssociationPage();

          cy.contains(`${duplicatePrimaryBeneficiaryData.firstName} ${duplicatePrimaryBeneficiaryData.lastName} has been successfully associated to this event`);
          const confirmHouseholdAssociationPage = new ConfirmHouseholdAssociationPage();
          cy.wait('@potentialDuplicateHousehold').then(async (interception) => {
            cy.wrap(interception.response.body.caseFile.householdId).as('potentialDuplicateHouseholdId'); // creates alias for potential duplicate household id
          });
          confirmHouseholdAssociationPage.getRegistrationNumber().should('exist');
          confirmHouseholdAssociationPage.getEventName().should('string', this.secondaryEventCreated.name.translation.en);
          confirmHouseholdAssociationPage.getPrintButton().should('be.visible');
          confirmHouseholdAssociationPage.getNewRegistrationButton().should('be.visible');

          cy.get('@potentialDuplicateHouseholdId').then((potentialDuplicateHouseholdId) => {
            cy.goTo(`casefile/household/${potentialDuplicateHouseholdId}`);
          });

          assertPotentialDuplicatesSteps({
            firstName: duplicatePrimaryBeneficiaryData.firstName,
            lastName: duplicatePrimaryBeneficiaryData.lastName,
            registrationNumber: this.primaryHouseholdRegistrationNumber,
            caseFileNumber: this.primaryHouseholdCaseFileNumber,
            eventName: this.primaryEventCreated.name.translation.en,
            roleName,
          });
        });
      });
    }
  });

  describe('Cannot roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('registration');
        });
        it('should not be able to register to an event', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
