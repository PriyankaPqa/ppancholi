import { BaseStoreComponents } from '@libs/stores-lib/base';
import { IPotentialDuplicateEntity, IdParams, DuplicateReason } from '@libs/entities-lib/potential-duplicate';
import { PotentialDuplicatesService, IPotentialDuplicatesServiceMock } from '@libs/services-lib/potential-duplicates/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IPotentialDuplicateEntity, IdParams>,
  service: PotentialDuplicatesService | IPotentialDuplicatesServiceMock,
) {
  async function getDuplicates(householdId: uuid): Promise<IPotentialDuplicateEntity[]> {
    const res = await service.getDuplicates(householdId);
    if (res) {
      baseComponents.setAll(res);
    }
    return res;
  }

  async function flagNewDuplicate(payload: { householdIds: uuid[], duplicateReasons: DuplicateReason[], memberFirstName: string,
     memberLastName: string, rationale: string }): Promise<IPotentialDuplicateEntity> {
    const res = await service.flagNewDuplicate(payload);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  async function flagDuplicate(id: uuid, rationale: string): Promise<IPotentialDuplicateEntity> {
    const res = await service.flagDuplicate(id, rationale);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  async function resolveDuplicate(id: uuid, rationale: string): Promise<IPotentialDuplicateEntity> {
    const res = await service.resolveDuplicate(id, rationale);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  return {
    getDuplicates,
    flagNewDuplicate,
    flagDuplicate,
    resolveDuplicate,
  };
}
