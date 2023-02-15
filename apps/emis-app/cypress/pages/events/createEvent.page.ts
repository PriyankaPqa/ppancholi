import { EventDetailsPage } from './eventDetails.page';

export enum DataTest {
    name = 'event-name',
    responseLevel = 'event-level',
    province = 'event-province',
    provinceOther = 'event-province-other',
    region = 'event-region',
    eventType = 'event-type',
    eventTypeOther = 'event-type-specified-other',
    assistanceNumber = 'event-phone',
    reportedDate = 'event-reported-date',
    eventStatus = 'event-switch-status',
    eventStatusText = 'event-status-text',
    registrationLink = 'event-registration-path',
    relatedEvents = 'event-related-events',
    description = 'event-description',
    cancelButton = 'cancel',
    submitButton = 'save',
    reOpenReason = 'reopen-reason',
    frenchTab = 'tab-lang-fr',
    englishTab = 'tab-lang-en',
}

export enum EventStatus {
    open = 'OPEN',
    onHold = 'ON HOLD',
}

export interface IFields {
    name?: string;
    responseLevelIndex?: number;
    responseLevel?: string;
    provinceIndex?: number;
    province?:string;
    provinceOther?: string;
    region?: string;
    eventTypeIndex?: number;
    eventType?: string;
    eventTypeOther?: string;
    assistanceNumber?: string;
    reportedDate?: { year: number; month: number; day: number };
    eventStatus?: EventStatus;
    relatedEventsIndex?: number[];
    relatedEvents?: string[];
    description?: string;
    reOpenReason?: string;
}

export class CreateEventPage {
  private name = { selector: DataTest.name, type: 'input' };

  private responseLevel = { selector: DataTest.responseLevel, type: 'div' };

  private province = { selector: DataTest.province, type: 'div' };

  private provinceOther = { selector: DataTest.provinceOther, type: 'input' };

  private region = { selector: DataTest.region, type: 'input' };

  private eventType = { selector: DataTest.eventType, type: 'div' };

  private eventTypeOther = { selector: DataTest.eventTypeOther, type: 'input' };

  private assistanceNumber = { selector: DataTest.assistanceNumber, type: 'input' };

  private reportedDate = { selector: DataTest.reportedDate, type: 'input' };

  private eventStatus = { selector: DataTest.eventStatus, type: 'input' };

  private eventStatusText = { selector: DataTest.eventStatusText, type: 'span' };

  private registrationLink = { selector: DataTest.registrationLink, type: 'input' };

  private relatedEvents = { selector: DataTest.relatedEvents, type: 'div' };

  private description = { selector: DataTest.description, type: 'textarea' };

  private cancelButton = { selector: DataTest.cancelButton, type: 'button' };

  private submitButton = { selector: DataTest.submitButton, type: 'button' };

  private reOpenReason = { selector: DataTest.reOpenReason, type: 'input' };

  private frenchTab = { selector: DataTest.frenchTab, type: 'button' };

  private englishTab = { selector: DataTest.englishTab, type: 'button' };

  load() {
    cy.goTo('events/create');
  }

  setStatus(status: EventStatus) {
    cy.getByDataTest(this.eventStatusText)
      .invoke('text')
      .then((currentStatusText) => {
        if (currentStatusText !== status) {
          cy.getByDataTest(this.eventStatus).click({ force: true });
        }
      });
  }

  // eslint-disable-next-line complexity,max-statements
  async fill(data: IFields) {
    if (data.name) {
      cy.getByDataTest(this.name).type(data.name);
    }

    if (data.responseLevelIndex !== undefined) {
      cy.selectListElementByIndex(DataTest.responseLevel, data.responseLevelIndex);
    }

    if (data.responseLevel) {
      cy.selectListElementByValue(DataTest.responseLevel, data.responseLevel);
    }

    if (data.provinceIndex !== undefined) {
      cy.selectListElementByIndex(DataTest.province, data.provinceIndex);
    }

    if (data.province) {
      cy.selectListElementByValue(DataTest.province, data.province);
    }

    if (data.provinceOther) {
      cy.getByDataTest(this.provinceOther).type(data.provinceOther);
    }

    if (data.region) {
      cy.writeInputSelect(DataTest.region, data.region);
    }

    if (data.eventTypeIndex !== undefined) {
      cy.selectListElementByIndex(DataTest.eventType, data.eventTypeIndex);
    }

    if (data.eventType) {
      cy.selectListElementByValue(DataTest.eventType, data.eventType);
    }

    if (data.eventTypeOther) {
      cy.getByDataTest(this.eventTypeOther).type(data.eventTypeOther);
    }

    if (data.assistanceNumber) {
      cy.getByDataTest(this.assistanceNumber).type(data.assistanceNumber);
    }

    if (data.reportedDate) {
      cy.setDatePicker(DataTest.reportedDate, data.reportedDate);
    }

    if (data.eventStatus) {
      this.setStatus(data.eventStatus);
    }

    if (data.relatedEventsIndex) {
      cy.selectMultipleElementByIndex(DataTest.relatedEvents, data.relatedEventsIndex);
    }

    if (data.relatedEvents) {
      cy.selectMultipleElementByValues(DataTest.relatedEvents, data.relatedEvents);
    }

    if (data.description) {
      cy.getByDataTest(this.description).type(data.description);
    }
  }

  saveAndGoToEventDetailsPage() {
    cy.getByDataTest(this.submitButton).click();
    return new EventDetailsPage();
  }
}
