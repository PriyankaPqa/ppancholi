import { ref, nextTick } from 'vue';
import { ECanadaProvinces, VForm } from '@libs/shared-lib/types';
import { IAddress } from '@libs/entities-lib/value-objects/address';
import { ICurrentAddress } from '@libs/entities-lib/value-objects/current-address';

export interface IAutocomplete {
  country: string;
  province: string;
  postalCode: string;
  city: string;
  street: string;
  location: {
    lat: number;
    lng: number;
  }
  name: string;
}

export function useAutocomplete() {
  const isAutocompleteAddress = ref(false);

  const resetGeoLocation = (address: IAddress) => {
    if (!isAutocompleteAddress.value) {
      address.latitude = 0;
      address.longitude = 0;
    }
  };

  // use this so resetGeoLocation will not be active during initialization of data
  const toggleResetGeoLocation = (active: boolean) => {
    isAutocompleteAddress.value = !active;
  };

  const setAddressFields = (autocomplete: IAutocomplete, address: IAddress, unitSuitNull = true) => {
    const {
      country, province, postalCode, city, street, location,
    } = autocomplete;
    address.country = country;
    address.province = country === 'CA' ? ECanadaProvinces[province as keyof typeof ECanadaProvinces] : null;
    address.specifiedOtherProvince = country === 'CA' ? null : province;
    address.postalCode = postalCode;
    address.city = city;
    address.streetAddress = street;
    address.latitude = location.lat;
    address.longitude = location.lng;
    if (unitSuitNull) {
      address.unitSuite = null;
    }
  };

  const streetAddressAutocomplete = async (autocomplete: IAutocomplete, address: IAddress) => {
    isAutocompleteAddress.value = true;
    setAddressFields(autocomplete, address, true);
    await nextTick();
    isAutocompleteAddress.value = false;
  };

  const streetCurrentAddressAutocomplete = async (autocomplete: IAutocomplete, currentAddress: ICurrentAddress) => {
    const { name } = autocomplete;
    isAutocompleteAddress.value = true;
    setAddressFields(autocomplete, currentAddress.address, false);

    if (currentAddress.requiresPlaceName()) {
      currentAddress.placeName = name;
    }
    if (currentAddress.hasPlaceNumber()) {
      currentAddress.placeNumber = null;
    } else if (currentAddress.hasUnitSuite()) {
      currentAddress.address.unitSuite = null;
    }

    await nextTick();
    isAutocompleteAddress.value = false;
  };

  const onChangeCountry = (country: string, address: IAddress, refForm: VForm) => {
    address.reset(country);
    refForm.reset();
  };

  return {
    toggleResetGeoLocation,
    isAutocompleteAddress,
    resetGeoLocation,
    streetAddressAutocomplete,
    streetCurrentAddressAutocomplete,
    onChangeCountry,
  };
}
