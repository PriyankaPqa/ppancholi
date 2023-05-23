import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';

import { ECurrentAddressTypes } from './currentAddress.types';
import {
  mockCampGround,
  mockCampgroundData,
  mockFriendsFamily,
  mockHotelMotel,
  mockMedicalFacility,
  mockOther,
  mockShelter,
} from './currentAddress.mock';
import { CurrentAddress } from './currentAddress';

const longText = 'x'.repeat(MAX_LENGTH_MD + 1);
const longSmallText = 'y'.repeat(MAX_LENGTH_SM + 1);

describe('>>> CurrentAddress', () => {
  describe('>> constructor', () => {
    it('should initialize data if passed', () => {
      const t = new CurrentAddress(mockCampgroundData());
      expect(t).toEqual(mockCampGround());
    });

    it('should reset if not data pass', () => {
      const t = new CurrentAddress();

      expect(t.address.country).toEqual('CA');
      expect(t.address.streetAddress).toEqual(null);
      expect(t.address.unitSuite).toEqual(null);
      expect(t.address.province).toEqual(null);
      expect(t.address.city).toEqual(null);
      expect(t.address.postalCode).toEqual(null);
      expect(t.address.latitude).toEqual(0);
      expect(t.address.longitude).toEqual(0);

      expect(t.addressType).toEqual(null);
      expect(t.placeName).toEqual('');
      expect(t.placeNumber).toEqual('');
      expect(t.shelterLocation).toEqual(null);
    });
  });

  describe('>> Methods', () => {
    describe('hasPlaceNumber', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.hasPlaceNumber()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.hasPlaceNumber()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.hasPlaceNumber()).toBeTruthy();
      });

      it('should return false for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.hasPlaceNumber()).toBeFalsy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.hasPlaceNumber()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.hasPlaceNumber()).toBeFalsy();
      });
    });

    describe('hasUnitSuite', () => {
      it('should return false for Campground', () => {
        const p = mockCampGround();
        expect(p.hasUnitSuite()).toBeFalsy();
      });

      it('should return false for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.hasUnitSuite()).toBeFalsy();
      });

      it('should return false for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.hasUnitSuite()).toBeFalsy();
      });

      it('should return true for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.hasUnitSuite()).toBeTruthy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.hasUnitSuite()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.hasUnitSuite()).toBeFalsy();
      });
    });

    describe('hasStreet', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.hasStreet()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.hasStreet()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.hasStreet()).toBeTruthy();
      });

      it('should return true for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.hasStreet()).toBeTruthy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.hasStreet()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.hasStreet()).toBeFalsy();
      });
    });

    describe('hasPostalCode', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.hasPostalCode()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.hasPostalCode()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.hasPostalCode()).toBeTruthy();
      });

      it('should return true for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.hasPostalCode()).toBeTruthy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.hasPostalCode()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.hasPostalCode()).toBeFalsy();
      });
    });

    describe('requiresPlaceName', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.requiresPlaceName()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.requiresPlaceName()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.requiresPlaceName()).toBeTruthy();
      });

      it('should return false for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.requiresPlaceName()).toBeFalsy();
      });

      it('should return true for Other', () => {
        const p = mockOther();
        expect(p.requiresPlaceName()).toBeTruthy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.requiresPlaceName()).toBeFalsy();
      });
    });

    describe('requiresCountry', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.requiresCountry()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.requiresCountry()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.requiresCountry()).toBeTruthy();
      });

      it('should return true for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.requiresCountry()).toBeTruthy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.requiresCountry()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.requiresCountry()).toBeFalsy();
      });
    });

    describe('requiresProvince', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.requiresProvince()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.requiresProvince()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.requiresProvince()).toBeTruthy();
      });

      it('should return true for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.requiresProvince()).toBeTruthy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.requiresProvince()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.requiresProvince()).toBeFalsy();
      });
    });

    describe('requiresCity', () => {
      it('should return true for Campground', () => {
        const p = mockCampGround();
        expect(p.requiresCity()).toBeTruthy();
      });

      it('should return true for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.requiresCity()).toBeTruthy();
      });

      it('should return true for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.requiresCity()).toBeTruthy();
      });

      it('should return true for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.requiresCity()).toBeTruthy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.requiresCity()).toBeFalsy();
      });

      it('should return false for Shelter', () => {
        const p = mockShelter();
        expect(p.requiresCity()).toBeFalsy();
      });
    });

    describe('requiresShelterLocation', () => {
      it('should return false for Campground', () => {
        const p = mockCampGround();
        expect(p.requiresShelterLocation()).toBeFalsy();
      });

      it('should return false for HotelMotel', () => {
        const p = mockHotelMotel();
        expect(p.requiresShelterLocation()).toBeFalsy();
      });

      it('should return false for MedicalFacility', () => {
        const p = mockMedicalFacility();
        expect(p.requiresShelterLocation()).toBeFalsy();
      });

      it('should return false for FriendsFamily', () => {
        const p = mockFriendsFamily();
        expect(p.requiresShelterLocation()).toBeFalsy();
      });

      it('should return false for Other', () => {
        const p = mockOther();
        expect(p.requiresShelterLocation()).toBeFalsy();
      });

      it('should return true for Shelter', () => {
        const p = mockShelter();
        expect(p.requiresShelterLocation()).toBeTruthy();
      });
    });

    describe('reset', () => {
      it('should reset the temporary address', () => {
        const t = mockCampGround();
        t.reset();

        expect(t.address.country).toEqual('CA');
        expect(t.address.streetAddress).toEqual(null);
        expect(t.address.unitSuite).toEqual(null);
        expect(t.address.province).toEqual(null);
        expect(t.address.city).toEqual(null);
        expect(t.address.postalCode).toEqual(null);
        expect(t.address.latitude).toEqual(0);
        expect(t.address.longitude).toEqual(0);

        expect(t.addressType).toEqual(null);
        expect(t.placeName).toEqual('');
        expect(t.placeNumber).toEqual('');
        expect(t.shelterLocation).toEqual(null);
      });

      it('should reset the temporary address with given type', () => {
        const t = mockCampGround();
        t.reset(ECurrentAddressTypes.HotelMotel);

        expect(t.address.country).toEqual('CA');
        expect(t.address.streetAddress).toEqual(null);
        expect(t.address.unitSuite).toEqual(null);
        expect(t.address.province).toEqual(null);
        expect(t.address.city).toEqual(null);
        expect(t.address.postalCode).toEqual(null);
        expect(t.address.latitude).toEqual(0);
        expect(t.address.longitude).toEqual(0);

        expect(t.addressType).toEqual(ECurrentAddressTypes.HotelMotel);
        expect(t.placeName).toEqual('');
        expect(t.placeNumber).toEqual('');
        expect(t.shelterLocation).toEqual(null);
      });
    });

    describe('>> validation', () => {
      describe('placeName', () => {
        test('when it is required', () => {
          const currentAddress = mockCampGround();
          currentAddress.placeName = '';
          const results = currentAddress.validate();
          expect(results).toContain('placeName is required');
        });

        test(`when it has a max of ${MAX_LENGTH_MD} characters`, () => {
          const currentAddress = mockCampGround();
          currentAddress.placeName = longText;
          expect(currentAddress.validate()).toContain(`placeName exceeds max length of ${MAX_LENGTH_MD}`);
        });
      });

      describe('country', () => {
        test('when it is required', () => {
          const currentAddress = mockCampGround();
          currentAddress.address.country = '';
          const results = currentAddress.validate();
          expect(results).toContain('country is required');
        });
      });

      describe('street', () => {
        test(`when it has a max of ${MAX_LENGTH_MD} characters`, () => {
          const currentAddress = mockCampGround();
          currentAddress.address.streetAddress = longText;
          expect(currentAddress.validate()).toContain(`street exceeds max length of ${MAX_LENGTH_MD}`);
        });
      });

      describe('city', () => {
        test('when it is required', () => {
          const currentAddress = mockCampGround();
          currentAddress.address.city = '';
          const results = currentAddress.validate();
          expect(results).toContain('city is required');
        });

        test(`when it has a max of ${MAX_LENGTH_MD} characters`, () => {
          const p = mockCampGround();
          p.address.city = longText;
          expect(p.validate()).toContain(`city exceeds max length of ${MAX_LENGTH_MD}`);
        });
      });

      describe('Province Territory', () => {
        test('when it is required', () => {
          const currentAddress = mockCampGround();
          currentAddress.address.province = null;
          const results = currentAddress.validate();
          expect(results).toContain('province is required');
        });
      });

      describe('Postal Code', () => {
        test(`when it has a max of ${MAX_LENGTH_SM} characters`, () => {
          const p = mockCampGround();
          p.address.country = 'FR';
          p.address.postalCode = longSmallText;
          expect(p.validate()).toContain(`postalCode exceeds max length of ${MAX_LENGTH_SM}`);
        });

        it('should be valid for Canada', () => {
          const p = mockCampGround();
          p.address.postalCode = 'JJ J';
          expect(p.validate()).toContain('postalCode is not valid');
        });
      });

      describe('placeNumber', () => {
        test(`when it has a max of ${MAX_LENGTH_SM} characters`, () => {
          const p = mockCampGround();
          p.placeNumber = longSmallText;
          expect(p.validate()).toContain(`placeNumber exceeds max length of ${MAX_LENGTH_SM}`);
        });
      });
    });
  });
});
