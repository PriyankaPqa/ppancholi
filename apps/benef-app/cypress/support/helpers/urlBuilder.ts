import { IEventEntity } from '@libs/entities-lib/event';

export const buildRegistrationUrl = (event : IEventEntity) => `registration/${event.registrationLink.translation.en}/?force-tenant=beneficiary-test.crc-tech-lab-test.com`;
