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
}

export class EventDetailsPage {
  private eventName = { selector: DataTest.eventName, type: 'div' };

  private eventType = { selector: DataTest.eventType, type: 'div' };

  private eventId = { selector: DataTest.eventId, type: 'div' };

  private eventProvince = { selector: DataTest.eventProvince, type: 'div' };

  private eventRegion = { selector: DataTest.eventRegion, type: 'div' };

  private eventPhone = { selector: DataTest.eventPhone, type: 'span' };

  private eventCreatedDate = { selector: DataTest.eventCreatedDate, type: 'div' };

  private eventReportedDate = { selector: DataTest.eventReportedDate, type: 'div' };

  private eventDescription = { selector: DataTest.eventDescription, type: 'div' };

  private eventLink = { selector: DataTest.eventLink, type: 'a' };

  private eventRegistrationToggle = { selector: DataTest.eventRegistrationToggle, type: 'input' };

  private eventStatus = { selector: DataTest.eventStatus, type: 'span' };

  private expandButton = { selector: DataTest.expandButton, type: 'button' };

  private financialAssistance = { selector: DataTest.financialAssistanceButton, type: 'a' };

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
    return cy.getByDataTest(this.eventName).invoke('text').then((text) => text);
  }

  public getEventType() {
    return cy.getByDataTest(this.eventType).invoke('text').then((text) => text);
  }

  public getEventId() {
    return cy.getByDataTest(this.eventId).invoke('text').then((text) => text);
  }

  public getEventProvince() {
    return cy.getByDataTest(this.eventProvince).invoke('text').then((text) => text);
  }

  public getEventRegion() {
    return cy.getByDataTest(this.eventRegion).invoke('text').then((text) => text);
  }

  public getEventPhone() {
    return cy.getByDataTest(this.eventPhone).invoke('text').then((text) => text);
  }

  public getEventCreatedDate() {
    return cy.getByDataTest(this.eventCreatedDate).invoke('text').then((text) => text);
  }

  public getEventReportedDate() {
    return cy.getByDataTest(this.eventReportedDate).invoke('text').then((text) => text);
  }

  public getEventDescription() {
    return cy.getByDataTest(this.eventDescription).invoke('text').then((text) => text);
  }

  public getEventLink() {
    return cy.getByDataTest(this.eventLink).invoke('text').then((text) => text);
  }

  public getEventStatus() {
    return cy.getByDataTest(this.eventStatus).invoke('text').then((text) => text);
  }

  public goToListOfFinancialAssistancePage() {
    cy.getByDataTest(this.financialAssistance).click();
    // return new ListOfFinancialAssistancePage();
  }

  public async isFinancialAssistanceButtonDisplayed() {
    // return this.isDisplayed(this.financialAssistance, expected ? this.baseTimeOut : TIMEOUT_NOT_DISPLAYED);
  }
}
