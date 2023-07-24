import { BaseStoreComponents } from '@libs/stores-lib/base';
import { IHouseholdEntity, IdParams } from '@libs/entities-lib/household';
import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import { ref } from 'vue';
import { IAddress } from '@libs/entities-lib/value-objects/address';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IHouseholdEntity, IdParams>,
  entityService: IHouseholdsService | IHouseholdsServiceMock,
) {
  const searchResultsShown = ref(false);

  async function updateNoFixedHomeAddress({ householdId, observation }: { householdId: string; observation: string }) {
    const res = await entityService.updateNoFixedHomeAddress(householdId, false, observation);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  async function updateHomeAddress({ householdId, address }: { householdId: string; address: IAddress }) {
    const res = await entityService.updateHomeAddress(householdId, false, address);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  return {
    searchResultsShown,
    updateNoFixedHomeAddress,
    updateHomeAddress,
  };
}
