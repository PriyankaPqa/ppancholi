import { ECanadaProvinces, ERegistrationMethod, ERegistrationMode } from '@libs/shared-lib/types';
import moment from 'moment';
import { IMoveHouseholdRequest } from '@libs/entities-lib/household-create/householdCreate.types';
import {
  ECurrentAddressTypes,
  IMember,
  IMemberMoveRequest,
  mockAddress,
  mockAddressData,
  mockCampGround,
  mockContactInformation,
  mockCreateHouseholdRequest,
  mockHotelMotel,
  mockHouseholdCreate,
  mockIdentitySet,
  mockMember,
  mockMemberCreateRequest,
  mockSplitHouseholdRequest,
} from '@libs/entities-lib/household-create';
import { mockHttp } from '../../http-client';
import { HouseholdsService } from './households';

const API_URL_SUFFIX = 'household';
const ORCHESTRATION_CONTROLLER = 'orchestration/orchestration-households';
const http = mockHttp();
const createBeneficiaryRequest = mockCreateHouseholdRequest();
const splitBeneficiaryRequest = mockSplitHouseholdRequest();
let service: HouseholdsService = null;

describe('>>> Beneficiaries Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    service = new HouseholdsService(http as never);
  });

  test('getGenders is linked to the correct URL', async () => {
    await service.getGenders();
    expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/genders/all`);
  });

  test('getPreferredLanguages is linked to the correct URL', async () => {
    await service.getPreferredLanguages();
    expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/preferred-languages`);
  });

  test('getPrimarySpokenLanguages is linked to the correct URL', async () => {
    await service.getPrimarySpokenLanguages();
    expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/primary-spoken-languages/all`);
  });

  test('getIndigenousCommunities is linked to the correct URL', async () => {
    await service.getIndigenousCommunities();
    expect(http.get).toHaveBeenCalledWith(`${API_URL_SUFFIX}/indigenous-communities`);
  });

  test('submitRegistration is linked to the correct URL', async () => {
    service.parseHouseholdPayload = jest.fn(() => createBeneficiaryRequest);

    await service.submitRegistration({
      household: mockHouseholdCreate(),
      eventId: 'event id',
      recaptchaToken: 'token',
    });

    expect(http.post).toHaveBeenCalledWith(
`${http.baseUrl}/${ORCHESTRATION_CONTROLLER}/public`,
      { ...createBeneficiaryRequest, recaptchaToken: 'token' },
      { globalHandler: false },
);
  });

  test('postPublicRegistration is linked to the correct URL', async () => {
    service.parseHouseholdPayload = jest.fn(() => createBeneficiaryRequest);

    await service.postPublicRegistration(createBeneficiaryRequest, 'token');

    expect(http.post).toHaveBeenCalledWith(
      `${http.baseUrl}/${ORCHESTRATION_CONTROLLER}/public`,
      { ...createBeneficiaryRequest, recaptchaToken: 'token' },
      { globalHandler: false },
    );
  });

  test('postRegistration is linked to the correct URL', async () => {
    service.parseHouseholdPayload = jest.fn(() => createBeneficiaryRequest);

    await service.postCrcRegistration(createBeneficiaryRequest);

    expect(http.post).toHaveBeenCalledWith(`${http.baseUrl}/${ORCHESTRATION_CONTROLLER}`, createBeneficiaryRequest, { globalHandler: false });
  });

  test('submitCRCRegistration is linked to the correct URL', async () => {
    service.parseHouseholdPayload = jest.fn(() => createBeneficiaryRequest);

    await service.submitCRCRegistration(mockHouseholdCreate(), 'event id');

    expect(http.post).toHaveBeenCalledWith(`${http.baseUrl}/${ORCHESTRATION_CONTROLLER}`, createBeneficiaryRequest, { globalHandler: false });
  });

  test('getPerson is linked to the correct URL', async () => {
    await service.getPerson('123');
    expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/persons/${'123'}`);
  });

  test('updatePersonContactInformation is linked to the correct URL', async () => {
    const contactInformation = mockContactInformation();
    const identitySet = mockIdentitySet();
    await service.updatePersonContactInformation('123', { contactInformation, identitySet, isPrimaryBeneficiary: true });
    expect(http.patch).toHaveBeenCalledWith(`${service.baseApi}/persons/${'123'}/contact-information`, {
      contactInformation: service.parseContactInformation(contactInformation),
      identitySet: service.parseIdentitySet(identitySet),
      isPrimaryBeneficiary: true,
    });
  });

  test('updatePersonIdentity is linked to the correct URL', async () => {
    const contactInformation = mockContactInformation();
    const identitySet = mockIdentitySet();
    await service.updatePersonIdentity('123', { contactInformation, identitySet });
    expect(http.patch).toHaveBeenCalledWith(`${service.baseApi}/persons/${'123'}/identity-set`, {
      contactInformation: service.parseContactInformation(contactInformation),
      identitySet: service.parseIdentitySet(identitySet),
    });
  });

  test('updatePersonAddress is linked to the correct URL', async () => {
    const currentAddress = mockCampGround();
    await service.updatePersonAddress('123', currentAddress);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseApi}/persons/${'123'}/current-address`, {
      currentAddress: service.parseCurrentAddress(currentAddress),
    });
  });

  test('updateHomeAddress is linked to the correct URL', async () => {
    const address = mockAddress();
    await service.updateHomeAddress('123', address);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${'123'}/address`, {
      address: {
        address: service.parseAddress(address),
        from: moment.utc(moment()).format(),
      },
    });
  });

  test('updateNoFixedHomeAddress is linked to the correct URL', async () => {
    await service.updateNoFixedHomeAddress('123', 'test');
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${'123'}/no-fixed-address`, {
      from: moment.utc(moment()).format(),
      observation: 'test',
    });
  });

  test('deleteAdditionalMember is linked to the correct URL', async () => {
    await service.deleteAdditionalMember('123', '345');
    expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/${'123'}/members/${'345'}`);
  });

  test('splitHousehold is linked to the correct URL', async () => {
    service.parseSplitHouseholdPayload = jest.fn(() => splitBeneficiaryRequest);
    await service.splitHousehold(mockHouseholdCreate(), '1234', 'event-id');
    expect(http.patch).toHaveBeenCalledWith(`${http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${'1234'}/split`, splitBeneficiaryRequest, { globalHandler: false });
  });

  test('moveMembers is linked to the correct URL', async () => {
    service.parseMovePayload = jest.fn(() => ({ foo: 'bar' } as unknown as IMoveHouseholdRequest));
    await service.moveMembers(mockHouseholdCreate(), mockHouseholdCreate());
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/move-household-members`, { foo: 'bar' });
  });

  test('addMember is linked to the correct URL', async () => {
    const member = mockMember();
    await service.addMember('123', member);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${'123'}/members`, {
      ...service.parseMember(member),
      registrationType: ERegistrationMode.CRC,
    });
  });

  test('validateEmail is linked to the correct URL', async () => {
    const email = 'abc@abc.ca';

    await service.validateEmail({ emailAddress: email });
    expect(http.post).toHaveBeenCalledWith(`${service.baseApi}/persons/validate-email-address`, {
      emailAddress: email,
    }, { globalHandler: false });
  });

  test('validatePublicEmail is linked to the correct URL', async () => {
    const email = 'abc@abc.ca';

    await service.validatePublicEmail({ emailAddress: email, recaptchaToken: '123' });
    expect(http.post).toHaveBeenCalledWith(`${service.baseApi}/persons/public/validate-email-address`, {
      emailAddress: email,
      recaptchaToken: '123',
    }, { globalHandler: false });
  });

  test('makePrimary is linked to the correct URL', async () => {
    const id = 'mock-id';
    const consentInformation = {
      registrationMethod: ERegistrationMethod.InPerson,
      registrationLocationId: null as string,
      crcUserName: 'John',
      privacyDateTimeConsent: '2021-01-01',
    };
    await service.makePrimary(id, 'member', consentInformation);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/assign-primary`, {
      memberId: 'member',
      consentInformation,
    });
  });

  test('getHouseholdActivity is linked to the correct URL', async () => {
    const id = 'mock-id';
    await service.getHouseholdActivity(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/activities`);
  });

  test('hasOutstandingPayments is linked to the correct URL', async () => {
    const id = 'mock-id';

    await service.hasOutstandingPayments(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/info-outstanding-payments`);
  });

  test('getHouseholdHistory is linked to the correct URL', async () => {
    const id = 'mock-id';
    await service.getHouseholdHistory(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/history`);
  });

  test('getHouseholdMetadataHistory is linked to the correct URL', async () => {
    const id = 'mock-id';
    await service.getHouseholdMetadataHistory(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/metadata/${id}/history`);
  });

  test('getMemberHistory is linked to the correct URL', async () => {
    const id = 'mock-id';
    await service.getMemberHistory(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/persons/${id}/history`);
  });

  test('getMemberMetadataHistory is linked to the correct URL', async () => {
    const id = 'mock-id';
    await service.getMemberMetadataHistory(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/persons/metadata/${id}/history`);
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`household/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('household/search/households', { params, isOData: true });
    });
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

      address.unitSuite = '';
      address.province = null;
      address.specifiedOtherProvince = 'other province';
      result = service.parseAddress(address);
      expect(result.unitSuite).toBe(null);
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
        indigenousIdentity: null,
      });
    });
  });

  describe('parseSplitHouseholdPayload', () => {
    it('returns the proper object', () => {
      service.parseHouseholdPayload = jest.fn(() => createBeneficiaryRequest);

      const household = { ...mockHouseholdCreate(), additionalMembers: [mockMember({ id: 'id-1' })] };

      expect(service.parseSplitHouseholdPayload(household, '123')).toEqual({
        noFixedHome: true,
        primaryBeneficiary: mockMemberCreateRequest(),
        homeAddress: null,
        eventId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
        consentInformation: null,
        primaryBeneficiaryId: household.primaryBeneficiary.id,
        additionalMemberIds: ['id-1'],
        registrationType: ERegistrationMode.CRC,
      });
    });
  });

  describe('parseMovePayload', () => {
    it('returns the proper object', () => {
      service.parseMoveMember = jest.fn(() => ({ memberId: 'id' } as unknown as IMemberMoveRequest));
      const household1 = {
        ...mockHouseholdCreate(), id: 'hh-1', primaryBeneficiary: mockMember(), additionalMembers: [] as IMember[],
      };
      const household2 = {
        ...mockHouseholdCreate(), id: 'hh-2', primaryBeneficiary: mockMember(), additionalMembers: [mockMember()],
      };
      expect(service.parseMovePayload(household1, household2)).toEqual({
        firstHouseholdId: 'hh-1',
        firstHouseholdMembers: [{ memberId: 'id' }],
        secondHouseholdId: 'hh-2',
        secondHouseholdMembers: [{ memberId: 'id' }, { memberId: 'id' }],
      });
    });
  });

  describe('parseHouseholdPayload', () => {
    it('does not generate homeAddress if noFixedHome', () => {
      const household = mockHouseholdCreate();
      household.noFixedHome = true;
      expect(service.parseHouseholdPayload(household, null).homeAddress).toBeNull();
    });

    it('generate homeAddress otherwise', () => {
      service.parseAddress = jest.fn(() => mockAddressData());
      const household = mockHouseholdCreate();
      household.noFixedHome = false;
      const built = service.parseHouseholdPayload(household, null);
      expect(built.homeAddress).toEqual(mockAddressData());
    });

    it('returns honeypot name if one was passed', () => {
      const household = mockHouseholdCreate();
      expect(service.parseHouseholdPayload(household, null).name).toBeFalsy();
      // eslint-disable-next-line
      (household.primaryBeneficiary.identitySet as any).name = 'dummy';
      expect(service.parseHouseholdPayload(household, null).name).toBe('dummy');
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

  describe('parseMoveMember', () => {
    it('should return the proper object', () => {
      const member = mockMember();
      const isPrimaryBeneficiary = true;
      const built = service.parseMoveMember(member, isPrimaryBeneficiary);
      expect(built).toEqual({
        isPrimaryBeneficiary,
        preferredLanguageId: member.contactInformation.preferredLanguage.id,
        memberId: member.id,
        currentAddress: service.parseCurrentAddress(member.currentAddress),
        identitySet: service.parseIdentitySet(member.identitySet),
      });
    });
  });
});
