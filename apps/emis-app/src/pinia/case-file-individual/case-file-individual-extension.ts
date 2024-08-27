import { BaseStoreComponents } from '@libs/stores-lib/base';
import { CaseFileIndividualsService, ICaseFileIndividualsServiceMock } from '@libs/services-lib/case-file-individuals';
import _cloneDeep from 'lodash/cloneDeep';
import { Status } from '@libs/shared-lib/types';
import { ICaseFileIndividualEntity, IdParams, ReceivingAssistanceDetail } from '@libs/entities-lib/case-file-individual';
import { ICurrentAddressData } from '@libs/entities-lib/value-objects/current-address';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ICaseFileIndividualEntity, IdParams>,
  service: CaseFileIndividualsService | ICaseFileIndividualsServiceMock,
) {
  function getByCaseFile(caseFileId: uuid) {
    return _cloneDeep(baseComponents.items.value.filter((x) => x.caseFileId === caseFileId && x.status === Status.Active));
  }

  async function createIndividual(payload: ICaseFileIndividualEntity): Promise<ICaseFileIndividualEntity> {
    const result = await service.createCaseFileIndividual(payload);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function addReceiveAssistanceDetails(caseFileId: uuid, id: uuid, item: ReceivingAssistanceDetail): Promise<ICaseFileIndividualEntity> {
    const result = await service.addReceiveAssistanceDetails(caseFileId, id, item);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function addTemporaryAddress(caseFileId: uuid, id: uuid, item: ICurrentAddressData): Promise<ICaseFileIndividualEntity> {
    const result = await service.addTemporaryAddress(caseFileId, id, item);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function editTemporaryAddress(caseFileId: uuid, id: uuid, item: ICurrentAddressData): Promise<ICaseFileIndividualEntity> {
    const result = await service.editTemporaryAddress(caseFileId, id, item);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    getByCaseFile,
    createIndividual,
    addReceiveAssistanceDetails,
    addTemporaryAddress,
    editTemporaryAddress,
  };
}
