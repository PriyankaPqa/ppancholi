import helpers from '@libs/entities-lib/helpers';
import { ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import VueI18n from 'vue-i18n';

export function useAddresses() {
  // TO DO remove last argument (mustRemoveRemainingInHome) when code related to feature flag RemainingInHomeForAdditionalMembers is removed
   function getCurrentAddressTypeItems(i18n: VueI18n, noFixedHome: Boolean, hasShelterLocations: Boolean, mustRemoveRemainingInHome: Boolean): Record<string, unknown>[] {
      let list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);

      if (!hasShelterLocations) {
        list = list.filter((item) => (item.value !== ECurrentAddressTypes.Shelter));
      }
      if (mustRemoveRemainingInHome || noFixedHome) {
        list = list.filter((i) => i.value !== ECurrentAddressTypes.RemainingInHome);
      }

      return list;
    }

    return {
      getCurrentAddressTypeItems,
    };
}
