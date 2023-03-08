import { ECanadaProvinces, IMultilingual } from '@libs/shared-lib/types';
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
    open = 'Open',
}

export interface ICreateEventFields {
    name?: IMultilingual;
    responseLevelIndex?: number;
    responseLevel?: string;
    provinceIndex?: ECanadaProvinces;
    provinceCode?:string;
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
    description?: IMultilingual;
    reOpenReason?: string;
}

export class CreateEventPage {
  private name = { selector: DataTest.name, type: 'input' };

  private provinceOther = { selector: DataTest.provinceOther, type: 'input' };

  private eventTypeOther = { selector: DataTest.eventTypeOther, type: 'input' };

  private assistanceNumber = { selector: DataTest.assistanceNumber, type: 'input' };

  private eventStatus = { selector: DataTest.eventStatus, type: 'input' };

  private eventStatusText = { selector: DataTest.eventStatusText };

  private description = { selector: DataTest.description, type: 'span' };

  private cancelButton = { selector: DataTest.cancelButton };

  private submitButton = { selector: DataTest.submitButton };

  private frenchTab = { selector: DataTest.frenchTab };

  public setStatus(status: EventStatus) {
    cy.getByDataTest(this.eventStatusText).invoke('text').then((currentStatusText) => {
      if (currentStatusText !== status) {
        cy.getByDataTest(this.eventStatus).click({ force: true });
      }
    });
  }

  // eslint-disable-next-line complexity,max-statements
  async fill(data: ICreateEventFields) {
    if (data.name.translation.en) {
      cy.getByDataTest(this.name).type(data.name.translation.en);
    }

    if (data.responseLevelIndex !== undefined) {
      cy.selectListElementByIndex(DataTest.responseLevel, data.responseLevelIndex - 1);
    }

    if (data.responseLevel) {
      cy.selectListElementByValue(DataTest.responseLevel, data.responseLevel);
    }

    if (data.provinceIndex) {
      cy.selectListElementByIndex(DataTest.province, data.provinceIndex - 1);
    }

    if (data.provinceCode) {
      cy.selectListElementByValue(DataTest.province, data.provinceCode);
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

    if (data.description.translation.en) {
      cy.getByDataTest(this.description).type(data.description.translation.en);
    }
  }

  async fillFrenchData(data: ICreateEventFields) {
    if (data.name.translation.fr) {
      cy.getByDataTest(this.name).clear().type(data.name.translation.fr);
    }

    if (data.description.translation.fr) {
      cy.getByDataTest(this.description).clear().type(data.description.translation.fr);
    }
  }

  public goToEventDetailsPage() {
    cy.getByDataTest(this.submitButton).click();
    return new EventDetailsPage();
  }

  public selectFrenchTab() {
    cy.getByDataTest(this.frenchTab).click();
  }
}
