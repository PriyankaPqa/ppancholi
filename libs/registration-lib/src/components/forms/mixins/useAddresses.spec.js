import helpers from '@libs/entities-lib/helpers';
import { ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import { i18n } from '../../../ui/plugins/i18n';

import { useAddresses } from './useAddresses';

const mockAddressTypes = [
  { value: ECurrentAddressTypes.Campground, text: 'Campground' },
  { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining in home' },
];
helpers.enumToTranslatedCollection = jest.fn(() => mockAddressTypes);

describe('useAddresses', () => {
  describe('getCurrentAddressTypeItems', () => {
    it('returns the list of temporary addresses types excludes Remaining in home if noFixedHome is true', async () => {
      const expectList = [
        { value: ECurrentAddressTypes.Campground, text: 'Campground' },
        { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
      ];
      const noFixedHome = true;
      const hasShelterLocations = true;
      const result = useAddresses().getCurrentAddressTypeItems(i18n, noFixedHome, hasShelterLocations);
      expect(result).toEqual(expectList);
    });
    it('returns the list of temporary addresses types includes Remaining in home if noFixedHome is false and mustRemoveRemainingInHome is false', async () => {
      const expectList = [
        { value: ECurrentAddressTypes.Campground, text: 'Campground' },
        { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
        { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining in home' },
      ];
      const noFixedHome = false;
      const hasShelterLocations = true;
      const result = useAddresses().getCurrentAddressTypeItems(i18n, noFixedHome, hasShelterLocations);
      expect(result).toEqual(expectList);
    });

    it('returns the list of temporary addresses types excludes shelter locations if hasShelterLocations is false', async () => {
      const expectList = [
        { value: ECurrentAddressTypes.Campground, text: 'Campground' },
        { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining in home' },
      ];
      const noFixedHome = false;
      const hasShelterLocations = false;
      const result = useAddresses().getCurrentAddressTypeItems(i18n, noFixedHome, hasShelterLocations);
      expect(result).toEqual(expectList);
    });

    it('returns the list of temporary addresses types includes shelter locations if hasShelterLocations is true', async () => {
      const expectList = [
        { value: ECurrentAddressTypes.Campground, text: 'Campground' },
        { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
        { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining in home' },
      ];
      const noFixedHome = false;
      const hasShelterLocations = true;
      const result = useAddresses().getCurrentAddressTypeItems(i18n, noFixedHome, hasShelterLocations);
      expect(result).toEqual(expectList);
    });

    it('returns the list of crc provided addresses if crcProvidedOnly is true', async () => {
      const expectList = [
        { value: ECurrentAddressTypes.Campground, text: 'Campground' },
        { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
      ];
      const noFixedHome = false;
      const hasShelterLocations = true;
      const crcProvidedOnly = true;
      const result = useAddresses().getCurrentAddressTypeItems(i18n, noFixedHome, hasShelterLocations, crcProvidedOnly);
      expect(result).toEqual(expectList);
    });
  });
});
