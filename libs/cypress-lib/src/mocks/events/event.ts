import { EEventStatus, EResponseLevel, IEventEntity } from '@libs/entities-lib/event';
import { faker } from '@faker-js/faker';
import { mockBaseData } from '@libs/entities-lib/base';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import {
 EventTypes, generateMultilingual, generateRandomEventName, today,
} from '../../helpers';

export const mockCreateEvent = (): IEventEntity => ({
  ...mockBaseData(),
  id: faker.datatype.uuid(),
  number: faker.datatype.number(),
  name: generateMultilingual(generateRandomEventName(), generateRandomEventName()),
  description: generateMultilingual(faker.lorem.text(), faker.lorem.text()),
  registrationLink: generateMultilingual(),
  location: {
    province: ECanadaProvinces.AB,
    provinceOther: generateMultilingual(),
    region: generateMultilingual(),
  },
  schedule: {
    status: EEventStatus.Open,
    scheduledOpenDate: today,
    scheduledCloseDate: faker.date.future(),
    openDate: faker.date.soon(),
    closeDate: null,
    updateReason: null,
    timestamp: faker.date.soon(),
  },
  scheduleHistory: [],
  responseDetails: {
    responseLevel: EResponseLevel.Level05,
    eventType: {
      optionItemId: EventTypes.ColdEvent,
      specifiedOther: '',
    },
    dateReported: today,
    assistanceNumber: faker.phone.number('+1514######'),
  },
  callCentres: [],
  registrationLocations: [],
  selfRegistrationEnabled: false,
  shelterLocations: [],
  eventStatus: EEventStatus.Open,
  relatedEventIds: [],
  agreements: [],
  validate: () => true,
  fillEmptyMultilingualAttributes: () => {},
});
