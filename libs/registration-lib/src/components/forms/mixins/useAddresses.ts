import helpers from '@libs/entities-lib/helpers';
import { ECurrentAddressTypes, addressTypeHasCrcProvided } from '@libs/entities-lib/household-create';
import VueI18n from 'vue-i18n';

export function useAddresses() {
   function getCurrentAddressTypeItems(i18n: VueI18n, noFixedHome: Boolean, hasShelterLocations: Boolean, crcProvidedOnly: boolean = false): Record<string, unknown>[] {
      let list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);

      if (!hasShelterLocations) {
        list = list.filter((item) => (item.value !== ECurrentAddressTypes.Shelter));
      }
      if (noFixedHome) {
        list = list.filter((i) => i.value !== ECurrentAddressTypes.RemainingInHome);
      }

      if (crcProvidedOnly) {
        list = list.filter((i) => addressTypeHasCrcProvided.indexOf(i.value as ECurrentAddressTypes) > -1);
      }

      return list;
    }

    return {
      getCurrentAddressTypeItems,
    };
}
