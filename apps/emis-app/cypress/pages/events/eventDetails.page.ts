import { UserRoles } from '@libs/cypress-lib/support/msal';
import { AddCallCentrePage } from './addCallCentre.page';
import { AddShelterLocationPage } from './addShelterLocation.page';
import { AddRegistrationLocationPage } from './addRegistrationLocation.page';
import { AddNewAgreementPage } from './addNewAgreement.page';

export enum DataTest {
  eventName = 'title-left-menu',
  eventType = 'event-typeName',
  eventId = 'event-id',
  eventProvince = 'event-location-province',
  eventRegion = 'event-location-region',
  eventPhone = 'event-phone',
  eventCreatedDate = 'event-created-date',
  eventReportedDate = 'event-reported-date',
  eventDescription = 'event-summary-description',
  eventResponseLevel = 'event-summary-response-level',
  eventLink = 'event-summary-registration-link',
  eventRegistrationToggle = 'event-summary-toggle-self-registration',
  eventStatus = 'statusSelect__chip',
  expandButton = 'expand-button',
  financialAssistanceButton = 'event-financial-assistance',
  addCallCentre = 'add-section-button-CallCentre',
  callCentreName = 'event-call-centre-section-name',
  callCentreStartDate = 'event-call-centre-section-start-date',
  callCentreEndDate = 'event-call-centre-section-end-date',
  addEventRegLocation = 'add-section-button-RegistrationLocation',
  registrationLocationName = 'event-registration-location-section-name',
  registrationLocationAddress = 'event-registration-location-section-address',
  registrationLocationStatus = 'event-registration-location-section-status',
  addShelterLocation = 'add-section-button-ShelterLocation',
  shelterLocationName = 'event-shelter-location-section-name',
  shelterLocationAddress = 'event-shelter-location-section-address',
  shelterLocationStatus = 'event-shelter-location-section-status',
  addAgreement = 'add-section-button-Agreement',
  agreementName = 'event-agreement-section-name-0',
  agreementStartDate = 'event-agreement-section-start-date-0',
  agreementEndDate = 'event-agreement-section-end-date-0',
  agreementType = 'event-agreement-section-type-0',
  agreementDetails = 'event-agreement-section-details-0',
}

export class EventDetailsPage {
  private eventName = { selector: DataTest.eventName };

  private eventType = { selector: DataTest.eventType };

  private eventId = { selector: DataTest.eventId };

  private eventProvince = { selector: DataTest.eventProvince };

  private eventRegion = { selector: DataTest.eventRegion };

  private eventPhone = { selector: DataTest.eventPhone };

  private eventCreatedDate = { selector: DataTest.eventCreatedDate };

  private eventReportedDate = { selector: DataTest.eventReportedDate };

  private eventDescription = { selector: DataTest.eventDescription };

  private eventLink = { selector: DataTest.eventLink };

  private eventResponseLevel = { selector: DataTest.eventResponseLevel };

  private eventRegistrationToggle = { selector: DataTest.eventRegistrationToggle, type: 'input' };

  private eventStatus = { selector: DataTest.eventStatus };

  private expandButton = { selector: DataTest.expandButton };

  private financialAssistance = { selector: DataTest.financialAssistanceButton };

  private addNewCallCentre = { selector: DataTest.addCallCentre };

  private callCentreName = { selector: DataTest.callCentreName };

  private callCentreStartDate = { selector: DataTest.callCentreStartDate };

  private callCentreEndDate = { selector: DataTest.callCentreEndDate };

  private addNewEventRegistrationLocation = { selector: DataTest.addEventRegLocation };

  private registrationLocationName = { selector: DataTest.registrationLocationName };

  private registrationLocationAddress = { selector: DataTest.registrationLocationAddress };

  private registrationLocationStatus = { selector: DataTest.registrationLocationStatus };

  private addNewShelterLocation = { selector: DataTest.addShelterLocation };

  private shelterLocationName = { selector: DataTest.shelterLocationName };

  private shelterLocationAddress = { selector: DataTest.shelterLocationAddress };

  private shelterLocationStatus = { selector: DataTest.shelterLocationStatus };

  private addAgreement = { selector: DataTest.addAgreement };

  private agreementName = { selector: DataTest.agreementName };

  private agreementStartDate = { selector: DataTest.agreementStartDate };

  private agreementEndDate = { selector: DataTest.agreementEndDate };

  private agreementType = { selector: DataTest.agreementType };

  private agreementDetails = { selector: DataTest.agreementDetails };

  public copyLink() {
    cy.getByDataTest(this.eventLink)
      .invoke('attr', 'href')
      .then((link) => link);
  }

  public expandDetails() {
    cy.getByDataTest(this.expandButton).click();
  }

  public enableSelfRegistration() {
    cy.getByDataTest(this.eventRegistrationToggle).click();
  }

  public getEventName() {
    return cy.getByDataTest(this.eventName).getAndTrimText();
  }

  public getEventType() {
    return cy.getByDataTest(this.eventType).getAndTrimText();
  }

  public getEventId() {
    return cy.getByDataTest(this.eventId).getAndTrimText();
  }

  public getEventProvince() {
    return cy.getByDataTest(this.eventProvince).getAndTrimText();
  }

  public getEventRegion() {
    return cy.getByDataTest(this.eventRegion).getAndTrimText();
  }

  public getEventPhone() {
    return cy.getByDataTest(this.eventPhone).getAndTrimText();
  }

  public getEventCreatedDate() {
    return cy.getByDataTest(this.eventCreatedDate).getAndTrimText();
  }

  public getEventReportedDate() {
    return cy.getByDataTest(this.eventReportedDate).getAndTrimText();
  }

  public getEventDescription() {
    return cy.getByDataTest(this.eventDescription).getAndTrimText();
  }

  public getEventResponseLevel() {
    return cy.getByDataTest(this.eventResponseLevel).getAndTrimText();
  }

  public getEventLink() {
    return cy.getByDataTest(this.eventLink).getAndTrimText();
  }

  public getEventStatus() {
    return cy.getByDataTest(this.eventStatus).getAndTrimText();
  }

  public addCallCentre() {
    cy.getByDataTest(this.addNewCallCentre).click();
    return new AddCallCentrePage();
  }

  public getCallCentreButton() {
    return cy.getByDataTest(this.addNewCallCentre);
  }

  public getCallCentreNameByRole(roleName: string, index = 0) {
    if (roleName === UserRoles.level5) {
      cy.getByDataTestLike(this.callCentreName).eq(1).should('exist');
    }
    return cy.getByDataTestLike(this.callCentreName).eq(index).getAndTrimText();
  }

  public getCallCentreStartDate(index = 0) {
    return cy.getByDataTestLike(this.callCentreStartDate).eq(index).getAndTrimText();
  }

  public getCallCentreEndDate(index = 0) {
    return cy.getByDataTestLike(this.callCentreEndDate).eq(index).getAndTrimText();
  }

  public addRegistrationLocation() {
    cy.getByDataTest(this.addNewEventRegistrationLocation).click();
    return new AddRegistrationLocationPage();
  }

  public getRegistrationLocationNameByRole(roleName: string, index = 0) {
    if (roleName === UserRoles.level5) {
      cy.getByDataTestLike(this.registrationLocationName).eq(1).should('exist');
    }
    return cy.getByDataTestLike(this.registrationLocationName).eq(index).getAndTrimText();
  }

  public getRegistrationLocationAddress(index = 0) {
    return cy.getByDataTestLike(this.registrationLocationAddress).eq(index).getAndTrimText();
  }

  public getRegistrationLocationStatus(index = 0) {
    return cy.getByDataTestLike(this.registrationLocationStatus).eq(index).getAndTrimText();
  }

  public getRegistrationLocationButton() {
    return cy.getByDataTest(this.addNewEventRegistrationLocation);
  }

  public addShelterLocation() {
    cy.getByDataTest(this.addNewShelterLocation).click();
    return new AddShelterLocationPage();
  }

  public getShelterLocationNameByRole(roleName: string, index = 0) {
    if (roleName === UserRoles.level5) {
      cy.getByDataTestLike(this.shelterLocationName).eq(1).should('exist');
    }
    return cy.getByDataTestLike(this.shelterLocationName).eq(index).getAndTrimText();
  }

  public getShelterLocationAddress(index = 0) {
    return cy.getByDataTestLike(this.shelterLocationAddress).eq(index).getAndTrimText();
  }

  public getShelterLocationStatus(index = 0) {
    return cy.getByDataTestLike(this.shelterLocationStatus).eq(index).getAndTrimText();
  }

  public getShelterLocationButton() {
    return cy.getByDataTest(this.addNewShelterLocation);
  }

  public addNewAgreement() {
    cy.getByDataTest(this.addAgreement).click();
    return new AddNewAgreementPage();
  }

  public getAgreementName(index = 0) {
    return cy.getByDataTestLike(this.agreementName).eq(index).getAndTrimText();
  }

  public getAgreementStartDate(index = 0) {
    return cy.getByDataTestLike(this.agreementStartDate).eq(index).getAndTrimText();
  }

  public getAgreementEndDate(index = 0) {
    return cy.getByDataTestLike(this.agreementEndDate).eq(index).getAndTrimText();
  }

  public getAgreementType(index = 0) {
    return cy.getByDataTestLike(this.agreementType).eq(index).getAndTrimText();
  }

  public getAgreementDetails(index = 0) {
    return cy.getByDataTestLike(this.agreementDetails).eq(index).getAndTrimText();
  }

  public getAddNewAgreementButton() {
    return cy.getByDataTest(this.addAgreement);
  }
}
