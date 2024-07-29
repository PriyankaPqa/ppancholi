import { BaseStoreComponents } from '@libs/stores-lib/base';
import { BookingRequestsService, IBookingRequestsServiceMock } from '@libs/services-lib/booking-requests';
import _cloneDeep from 'lodash/cloneDeep';
import { Status } from '@libs/shared-lib/types';
import { IBookingRequest, IdParams } from '@libs/entities-lib/booking-request';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IBookingRequest, IdParams>,
  service: BookingRequestsService | IBookingRequestsServiceMock,
) {
  function getByCaseFile(caseFileId: uuid) {
    return _cloneDeep(baseComponents.items.value.filter((x) => x.caseFileId === caseFileId && x.status === Status.Active));
  }

  async function createBookingRequest(payload: IBookingRequest): Promise<IBookingRequest> {
    const result = await service.createBookingRequest(payload);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  return {
    getByCaseFile,
    createBookingRequest,
  };
}
