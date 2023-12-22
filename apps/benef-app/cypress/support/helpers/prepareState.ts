import { IProvider } from '@/services/provider';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdManageDuplicateRequest } from '@libs/cypress-lib/mocks/household/household';

/**
 * Creates a household
 * @param provider
 * @param event
 */
export const createHousehold = async (provider: IProvider, event: IEventEntity) => {
  const mockCreateHousehold = mockCreateHouseholdManageDuplicateRequest({ eventId: event.id });
  const registrationResponse = await provider.households.postPublicRegistration(mockCreateHousehold);
  return { registrationResponse, mockCreateHousehold };
};
