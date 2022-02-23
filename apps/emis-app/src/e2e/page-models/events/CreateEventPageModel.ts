import { Selector, t } from 'testcafe';
import {
  selectListElementByIndex, selectListElementByValue, selectMultipleElementByIndex, selectMultipleElementByValues, setDatePicker, writeInputSelect,
} from '../../helpers/interaction';

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
  englishTab = 'tab-lang-en'
}

class CreateEventPageModel {
  name: Selector;

  responseLevel: Selector;

  province: Selector;

  provinceOther: Selector;

  region: Selector;

  eventType: Selector;

  eventTypeOther: Selector;

  assistanceNumber: Selector;

  reportedDate: Selector;

  eventStatus: Selector;

  registrationLink: Selector;

  relatedEvents: Selector;

  description: Selector;

  cancelButton: Selector;

  submitButton: Selector;

  reOpenReason: Selector;

  frenchTab: Selector;

  englishTab: Selector;

  constructor() {
    this.name = Selector('input').withAttribute('data-test', DataTest.name);
    this.responseLevel = Selector('div').withAttribute('data-test', DataTest.responseLevel);
    this.province = Selector('div').withAttribute('data-test', DataTest.province);
    this.provinceOther = Selector('input').withAttribute('data-test', DataTest.provinceOther);
    this.region = Selector('input').withAttribute('data-test', DataTest.region);
    this.eventType = Selector('div').withAttribute('data-test', DataTest.eventType);
    this.eventTypeOther = Selector('input').withAttribute('data-test', DataTest.eventTypeOther);
    this.assistanceNumber = Selector('div').withAttribute('data-test', DataTest.assistanceNumber);
    this.reportedDate = Selector('input').withAttribute('data-test', DataTest.reportedDate);
    this.eventStatus = Selector('input').withAttribute('data-test', DataTest.eventStatus);
    this.registrationLink = Selector('input').withAttribute('data-test', DataTest.registrationLink);
    this.relatedEvents = Selector('div').withAttribute('data-test', DataTest.relatedEvents);
    this.description = Selector('textarea').withAttribute('data-test', DataTest.description);
    this.cancelButton = Selector('button').withAttribute('data-test', DataTest.cancelButton);
    this.submitButton = Selector('button').withAttribute('data-test', DataTest.submitButton);
    this.reOpenReason = Selector('input').withAttribute('data-test', DataTest.reOpenReason);
    this.frenchTab = Selector('button').withAttribute('data-test', DataTest.frenchTab);
    this.englishTab = Selector('button').withAttribute('data-test', DataTest.englishTab);
  }

  async save() {
    await t.click(this.submitButton());
  }

  async cancel() {
    await t.click(this.cancelButton());
  }

  async setName(name: string) {
    await t.typeText(this.name, name);
  }

  async pickResponseLevelByIndex(index: number) {
    await selectListElementByIndex(DataTest.responseLevel, index);
  }

  async pickResponseLevelByValue(value: string) {
    await selectListElementByValue(DataTest.responseLevel, value);
  }

  async pickProvinceByIndex(index: number) {
    await selectListElementByIndex(DataTest.province, index);
  }

  async pickProvinceByValue(value: string) {
    await selectListElementByValue(DataTest.province, value);
  }

  async setProvinceOther(value: string) {
    await t.typeText(this.provinceOther(), value);
  }

  // TODO - pickRegion in case we want to select an already existing region
  async setRegion(value: string) {
    await writeInputSelect(DataTest.region, value);
  }

  async pickEventTypeByIndex(index: number) {
    await selectListElementByIndex(DataTest.eventType, index);
  }

  async pickEventTypeByValue(value: string) {
    await selectListElementByValue(DataTest.eventType, value);
  }

  async setEventTypeOther(value: string) {
    await t.typeText(this.eventTypeOther(), value);
  }

  async setAssistancePhoneNumber(phoneNumber: string) {
    await t.typeText(this.assistanceNumber(), phoneNumber);
  }

  async setReportedDate({ year, month, day }: {year: number; month: number; day: number}) {
    await setDatePicker(this.reportedDate, { year, month, day });
  }

  async clickOnStatus() {
    await t.click(this.eventStatus());
  }

  async setRegistrationLink(link: string) {
    await t.typeText(this.registrationLink(), link);
  }

  async pickRelatedEventsByIndex(indexes: number[]) {
    await selectMultipleElementByIndex(DataTest.relatedEvents, indexes);
  }

  async pickRelatedEventsByValue(values: string[]) {
    await selectMultipleElementByValues(DataTest.relatedEvents, values);
  }

  async setDescription(description: string) {
    await t.typeText(this.description(), description);
  }

  async setStatus(status: EventStatus) {
    const currentStatus = await Selector('span').withAttribute('data-test', DataTest.eventStatusText).innerText;

    if (currentStatus !== status) {
      await this.clickOnStatus();
    }
  }

  // eslint-disable-next-line complexity,max-statements
  async fill(data: IFields) {
    if (data.name) {
      await this.setName(data.name);
    }

    if (data.responseLevelIndex !== undefined) {
      await this.pickResponseLevelByIndex(data.responseLevelIndex);
    }

    if (data.responseLevel) {
      await this.pickResponseLevelByValue(data.responseLevel);
    }

    if (data.provinceIndex !== undefined) {
      await this.pickProvinceByIndex(data.provinceIndex);
    }

    if (data.province) {
      await this.pickProvinceByValue(data.province);
    }

    if (data.provinceOther) {
      await this.setProvinceOther(data.provinceOther);
    }

    if (data.region) {
      await this.setRegion(data.region);
    }

    if (data.eventTypeIndex !== undefined) {
      await this.pickEventTypeByIndex(data.eventTypeIndex);
    }

    if (data.eventType) {
      await this.pickEventTypeByValue(data.eventType);
    }

    if (data.eventTypeOther) {
      await this.setEventTypeOther(data.eventTypeOther);
    }

    if (data.assistanceNumber) {
      await this.setAssistancePhoneNumber(data.assistanceNumber);
    }

    if (data.reportedDate) {
      await this.setReportedDate(data.reportedDate);
    }

    if (data.eventStatus) {
      await this.setStatus(data.eventStatus);
    }

    if (data.relatedEventsIndex) {
      await this.pickRelatedEventsByIndex(data.relatedEventsIndex);
    }

    if (data.relatedEvents) {
      await this.pickRelatedEventsByValue(data.relatedEvents);
    }

    if (data.description) {
      await this.setDescription(data.description);
    }
  }

  async createEvent(data: IFields) {
    await this.fill(data);
    await this.save();
  }

  async selectLanguage(lang: 'fr' | 'en') {
    if (lang === 'fr') {
      await t.click(this.frenchTab());
    }
    if (lang === 'en') {
      await t.click(this.englishTab());
    }
  }
}

export default new CreateEventPageModel();
