import { mockHttp } from '@/services/httpClient.mock';
import { ECanadaProvinces, IAzureSearchParams } from '@/types';
import {
  mockAddressData,
  mockHouseholdCreate,
  mockContactInformation,
  mockCreateHouseholdRequest,
  mockMember, ECurrentAddressTypes, mockIdentitySet, mockHotelMotel,
} from '../../entities/household-create';
import { HouseholdsService } from './households';

const http = mockHttp();
const createBeneficiaryRequest = mockCreateHouseholdRequest();
let service: HouseholdsService = null;

describe('>>> Beneficiaries Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    service = new HouseholdsService(http as never);
  });

  test('getGenders is linked to the correct URL', async () => {
    await service.getGenders();
    expect(http.get).toHaveBeenCalledWith('/household/genders');
  });

  test('getPreferredLanguages is linked to the correct URL', async () => {
    await service.getPreferredLanguages();
    expect(http.get).toHaveBeenCalledWith('/household/preferred-languages');
  });

  test('getPrimarySpokenLanguages is linked to the correct URL', async () => {
    await service.getPrimarySpokenLanguages();
    expect(http.get).toHaveBeenCalledWith('/household/primary-spoken-languages');
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

  test('submitRegistration is linked to the correct URL', async () => {
    service.parseHouseholdPayload = jest.fn(() => createBeneficiaryRequest);

    await service.submitRegistration(mockHouseholdCreate(), 'event id', 'privacy consent date time');

    expect(http.post).toHaveBeenCalledWith('/household/households', createBeneficiaryRequest, { globalHandler: false });
  });

  describe('parseMember', () => {
    it('should return the correct object', () => {
      const member = mockMember();

      const built = service.parseMember(member);
      expect(built).toEqual({
        identitySet: service.parseIdentitySet(member.identitySet),
        currentAddress: service.parseCurrentAddress(member.currentAddress),
        contactInformation: service.parseContactInformation(member.contactInformation),
      });
    });
  });

  describe('parseCurrentAddress', () => {
    it('should not generate placeAddress in some cases', () => {
      const currentAddress = mockHotelMotel();

      currentAddress.addressType = ECurrentAddressTypes.RemainingInHome;
      expect(service.parseCurrentAddress(currentAddress).address).toBeNull();

      currentAddress.addressType = ECurrentAddressTypes.Other;
      expect(service.parseCurrentAddress(currentAddress).address).toBeNull();

      currentAddress.addressType = ECurrentAddressTypes.Shelter;
      expect(service.parseCurrentAddress(currentAddress).address).toBeNull();

      currentAddress.addressType = ECurrentAddressTypes.Unknown;
      expect(service.parseCurrentAddress(currentAddress).address).toBeNull();

      currentAddress.addressType = ECurrentAddressTypes.Campground;
      expect(service.parseCurrentAddress(currentAddress).address).not.toBeNull();
    });
  });

  describe('parseAddress', () => {
    it('should return the correct object', () => {
      const address = mockAddressData();
      let result = service.parseAddress(address);
      expect(result).toEqual(address);

      address.province = null;
      address.specifiedOtherProvince = 'other province';
      result = service.parseAddress(address);
      expect(result.province).toBe(ECanadaProvinces.OT);
      expect(result.specifiedOtherProvince).toBe('other province');
    });
  });

  describe('parseContactInformation', () => {
    it('should return the correct object', () => {
      const contactInformation = mockContactInformation();

      let payload = service.parseContactInformation(contactInformation);

      expect(payload.preferredLanguage.optionItemId).toBe(contactInformation.preferredLanguage.id);
      expect(payload.preferredLanguage.specifiedOther).toBe(null);

      expect(payload.primarySpokenLanguage.optionItemId).toBe(contactInformation.primarySpokenLanguage.id);
      expect(payload.primarySpokenLanguage.specifiedOther).toBe(null);

      contactInformation.preferredLanguage.isOther = true;
      contactInformation.preferredLanguageOther = 'other preferred language';
      contactInformation.primarySpokenLanguage.isOther = true;
      contactInformation.primarySpokenLanguageOther = 'other primary spoken language';
      payload = service.parseContactInformation(contactInformation);

      expect(payload.preferredLanguage.specifiedOther).toBe('other preferred language');
      expect(payload.primarySpokenLanguage.specifiedOther).toBe('other primary spoken language');

      contactInformation.primarySpokenLanguage = null;
      payload = service.parseContactInformation(contactInformation);
      expect(payload.primarySpokenLanguage).toBeNull();
    });
  });

  describe('parseIdentitySet', () => {
    it('should return the proper object', () => {
      const identitySet = mockIdentitySet();

      const built = service.parseIdentitySet(identitySet);
      expect(built).toEqual({
        firstName: identitySet.firstName,
        middleName: identitySet.middleName,
        lastName: identitySet.lastName,
        preferredName: identitySet.preferredName,
        dateOfBirth: identitySet.dateOfBirth,
        gender: {
          optionItemId: identitySet.gender.id,
          specifiedOther: identitySet.gender.isOther ? identitySet.genderOther : null,
        },
        indigenousIdentity: {
          indigenousCommunityId: identitySet.indigenousCommunityId,
          specifiedOther: identitySet.indigenousCommunityOther,
        },
      });
    });
  });

  describe('parseIndigenousIdentity', () => {
    it('should return null if both properties are null', () => {
      const identitySet = mockIdentitySet();
      identitySet.indigenousCommunityId = null;
      identitySet.indigenousCommunityOther = null;

      const built = service.parseIndigenousIdentity(identitySet);
      expect(built).toEqual(null);
    });

    it('should return both id and other properties', () => {
      const identitySet = mockIdentitySet();

      const built = service.parseIndigenousIdentity(identitySet);
      expect(built).toEqual({
        indigenousCommunityId: identitySet.indigenousCommunityId,
        specifiedOther: identitySet.indigenousCommunityOther,
      });
    });
  });

  describe('parseHouseholdPayload', () => {
    it('does not generate homeAddress if noFixedHome', () => {
      const household = mockHouseholdCreate();
      household.noFixedHome = true;
      expect(service.parseHouseholdPayload(household, null, null).homeAddress).toBeNull();
    });

    it('generate homeAddress otherwise', () => {
      service.parseAddress = jest.fn(() => mockAddressData());
      const household = mockHouseholdCreate();
      household.noFixedHome = false;
      const built = service.parseHouseholdPayload(household, null, null);
      expect(built.homeAddress).toEqual(mockAddressData());
    });
  });

  describe('parseAdditionalMember', () => {
    it('should return the proper object', () => {
      const member = mockMember();

      const built = service.parseAdditionalMember(member);
      expect(built).toEqual({
        identitySet: service.parseIdentitySet(member.identitySet),
        currentAddress: service.parseCurrentAddress(member.currentAddress),
        contactInformation: null,
      });
    });
  });
});
