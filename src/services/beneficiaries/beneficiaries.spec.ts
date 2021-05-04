import { mockHttp } from '@/services/httpClient.mock';
import { IAzureSearchParams } from '@/types';
import {
  ETemporaryAddressTypes, IPhoneNumber, ITemporaryAddress, mockBeneficiary, mockContactInformation, mockCreateBeneficiaryRequest, mockPerson,
} from '../../entities/beneficiary';
import { BeneficiariesService } from './beneficiaries';

const http = mockHttp();
const createBeneficiaryRequest = mockCreateBeneficiaryRequest();

describe('>>> Beneficiaries Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  const service = new BeneficiariesService(http as never);

  test('getGenders is linked to the correct URL', async () => {
    await service.getGenders();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/genders');
  });

  test('getPreferredLanguages is linked to the correct URL', async () => {
    await service.getPreferredLanguages();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/preferred-languages');
  });

  test('getPrimarySpokenLanguages is linked to the correct URL', async () => {
    await service.getPrimarySpokenLanguages();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/primary-spoken-languages');
  });

  test('searchIndigenousIdentities is linked to the correct URL', async () => {
    const params: IAzureSearchParams = {
      filter: {
        Province: 13,
      },
    };

    await service.searchIndigenousIdentities(params);
    expect(http.get).toHaveBeenCalledWith('/public-search/indigenous-identities', { params, isOData: true });
  });

  describe('Build beneficiary payload', () => {
    test('buildBeneficiaryPayload does not generate homeAddress if noFixedHome', () => {
      const beneficiary = mockBeneficiary();

      beneficiary.noFixedHome = true;
      expect(service.buildBeneficiaryPayload(beneficiary, null).homeAddress).toBeNull();

      beneficiary.noFixedHome = false;
      expect(service.buildBeneficiaryPayload(beneficiary, null).homeAddress).toEqual(beneficiary.homeAddress);
    });

    test('buildPerson build gender object properly', () => {
      const person = mockPerson();

      let { gender } = service.buildPerson(person);
      expect(gender.optionItemId).toBe(person.gender.id);
      expect(gender.specifiedOther).toBeNull();

      person.gender.isOther = true;
      person.genderOther = 'other gender';
      gender = service.buildPerson(person).gender;
      expect(gender.specifiedOther).toBe('other gender');
    });

    test('buildTemporaryAddress does not generate placeAddress in some cases', () => {
      const temporaryAddress = { placeName: 'place name' } as ITemporaryAddress;

      temporaryAddress.temporaryAddressType = ETemporaryAddressTypes.RemainingInHome;
      expect(service.buildTemporaryAddress(temporaryAddress).placeAddress).toBeNull();

      temporaryAddress.temporaryAddressType = ETemporaryAddressTypes.Other;
      expect(service.buildTemporaryAddress(temporaryAddress).placeAddress).toBeNull();

      temporaryAddress.temporaryAddressType = ETemporaryAddressTypes.Shelter;
      expect(service.buildTemporaryAddress(temporaryAddress).placeAddress).toBeNull();

      temporaryAddress.temporaryAddressType = ETemporaryAddressTypes.Unknown;
      expect(service.buildTemporaryAddress(temporaryAddress).placeAddress).toBeNull();

      temporaryAddress.temporaryAddressType = ETemporaryAddressTypes.Campground;
      expect(service.buildTemporaryAddress(temporaryAddress).placeAddress).not.toBeNull();
    });

    test('buildContactInformation build properly', () => {
      const contactInformation = mockContactInformation();

      let payload = service.buildContactInformation(contactInformation);

      expect(payload.preferredLanguage.optionItemId).toBe(contactInformation.preferredLanguage.id);
      expect(payload.preferredLanguage.specifiedOther).toBe(null);

      expect(payload.primarySpokenLanguage.optionItemId).toBe(contactInformation.primarySpokenLanguage.id);
      expect(payload.primarySpokenLanguage.specifiedOther).toBe(null);

      contactInformation.preferredLanguage.isOther = true;
      contactInformation.preferredLanguageOther = 'other preferred language';
      contactInformation.primarySpokenLanguage.isOther = true;
      contactInformation.primarySpokenLanguageOther = 'other primary spoken language';
      payload = service.buildContactInformation(contactInformation);

      expect(payload.preferredLanguage.specifiedOther).toBe('other preferred language');
      expect(payload.primarySpokenLanguage.specifiedOther).toBe('other primary spoken language');
    });

    test('buildPhoneNumber build payload properly', () => {
      const phoneNumber: IPhoneNumber = { e164Number: '+15154545454', number: '(515) 454-5454', countryISO2: 'CA' } as IPhoneNumber;

      const payload = service.buildPhoneNumber(phoneNumber);
      expect(payload.countryCode).toBe(phoneNumber.countryISO2);
    });
  });

  test('submitRegistration is linked to the correct URL', async () => {
    service.buildBeneficiaryPayload = jest.fn(() => createBeneficiaryRequest);

    await service.submitRegistration(mockBeneficiary(), 'event id');

    expect(http.post).toHaveBeenCalledWith('/beneficiary/beneficiaries', createBeneficiaryRequest);
  });
});
