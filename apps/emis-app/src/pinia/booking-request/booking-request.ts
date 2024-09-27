import { httpClient } from '@/services/httpClient';
import { IBookingRequest, IdParams } from '@libs/entities-lib/booking-request';
import { BookingRequestsService } from '@libs/services-lib/booking-requests';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/booking-request/booking-request-extension';

export type Entity = IBookingRequest;

const storeId = 'booking-request';
const entityService = new BookingRequestsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useBookingRequestStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
