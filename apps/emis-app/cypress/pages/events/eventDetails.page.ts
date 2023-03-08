import { formatDate } from '@libs/cypress-lib/helpers/date';
import { AddCallCentrePage } from './addCallCentre.page';
import { AddShelterLocationPage } from './addShelterLocation.page';
import { AddRegistrationLocationPage } from './addRegistrationLocation.page';

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
    return cy.getByDataTest(this.eventName).invoke('text').then((text) => text.trim());
  }

  public getEventType() {
    return cy.getByDataTest(this.eventType).invoke('text').then((text) => text.trim());
  }

  public getEventId() {
    return cy.getByDataTest(this.eventId).invoke('text').then((text) => text.trim());
  }

  public getEventProvince() {
    return cy.getByDataTest(this.eventProvince).invoke('text').then((text) => text.trim());
  }

  public getEventRegion() {
    return cy.getByDataTest(this.eventRegion).invoke('text').then((text) => text.trim());
  }

  public getEventPhone() {
    return cy.getByDataTest(this.eventPhone).invoke('text').then((text) => text.trim());
  }

  public getEventCreatedDate() {
    return cy.getByDataTest(this.eventCreatedDate).invoke('text').then((text) => text.trim());
  }

  public getEventReportedDate() {
    return cy.getByDataTest(this.eventReportedDate).invoke('text').then((text) => text.trim());
  }

  public getEventDescription() {
    return cy.getByDataTest(this.eventDescription).invoke('text').then((text) => text.trim());
  }

  public getEventLink() {
    return cy.getByDataTest(this.eventLink).invoke('text').then((text) => text.trim());
  }

  public getEventStatus() {
    return cy.getByDataTest(this.eventStatus).invoke('text').then((text) => text.trim());
  }

  public addCallCentre() {
    cy.getByDataTest(this.addNewCallCentre).click();
    return new AddCallCentrePage();
  }

  public getCallCentreButton() {
    return cy.getByDataTest(this.addNewCallCentre);
  }

  public getCallCentreNameByRole(roleName: string, index = 0) {
    if (roleName === 'Level5') {
      cy.getByDataTestLike(this.callCentreName).eq(1).should('exist');
    }
    return cy.getByDataTestLike(this.callCentreName).eq(index).invoke('text').then((text) => text.trim());
  }

  public getCallCentreStartDate(index = 0) {
    return cy.getByDataTestLike(this.callCentreStartDate).eq(index).invoke('text').then((date) => formatDate(date));
  }

  public getCallCentreEndDate(index = 0) {
    return cy.getByDataTestLike(this.callCentreEndDate).eq(index).invoke('text').then((date) => formatDate(date));
  }

  public addRegistrationLocation() {
    cy.getByDataTest(this.addNewEventRegistrationLocation).click();
    return new AddRegistrationLocationPage();
  }

  public getRegistrationLocationNameByRole(roleName: string, index = 0) {
    if (roleName === 'Level5') {
      cy.getByDataTestLike(this.registrationLocationName).eq(1).should('exist');
    }
    return cy.getByDataTestLike(this.registrationLocationName).eq(index).invoke('text').then((text) => text.trim());
  }

  public getRegistrationLocationAddress(index = 0) {
    return cy.getByDataTestLike(this.registrationLocationAddress).eq(index).invoke('text').then((text) => text.trim());
  }

  public getRegistrationLocationStatus(index = 0) {
    return cy.getByDataTestLike(this.registrationLocationStatus).eq(index).invoke('text').then((text) => text.trim());
  }

  public getRegistrationLocationButton() {
    return cy.getByDataTest(this.addNewEventRegistrationLocation);
  }

  public addShelterLocation() {
    cy.getByDataTest(this.addNewShelterLocation).click();
    return new AddShelterLocationPage();
  }

  public getShelterLocationNameByRole(roleName: string, index = 0) {
    if (roleName === 'Level5') {
      cy.getByDataTestLike(this.shelterLocationName).eq(1).should('exist');
    }
    return cy.getByDataTestLike(this.shelterLocationName).eq(index).invoke('text').then((text) => text.trim());
  }

  public getShelterLocationAddress(index = 0) {
    return cy.getByDataTestLike(this.shelterLocationAddress).eq(index).invoke('text').then((text) => text.trim());
  }

  public getShelterLocationStatus(index = 0) {
    return cy.getByDataTestLike(this.shelterLocationStatus).eq(index).invoke('text').then((text) => text.trim());
  }

  public getShelterLocationButton() {
    return cy.getByDataTest(this.addNewShelterLocation);
  }
}
