import {
  Address,
  HouseholdCreate,
  mockHouseholdCreate,
  mockHouseholdCreateData, mockCampGround,
  mockAdditionalMember,
  Member,
  mockMember,
  mockAddress,
} from './index';

describe('>>> Household', () => {
  describe('>>constructor', () => {
    it('should initialize data if passed', () => {
      const h = new HouseholdCreate(mockHouseholdCreateData());
      expect(h).toEqual(mockHouseholdCreate());
    });

    it('should reset if not data pass', () => {
      const h = new HouseholdCreate();
      expect(h.noFixedHome).toEqual(false);
      expect(h.primaryBeneficiary).toEqual(new Member());
      expect(h.homeAddress).toEqual(new Address());
      expect(h.additionalMembers).toEqual([]);
      expect(h.consentInformation).toEqual({
        crcUserName: null,
        registrationMethod: null,
        registrationLocationId: null,
        privacyDateTimeConsent: null,
      });
      expect(h.id).toEqual('');
      expect(h.registrationNumber).toEqual('');
    });
  });

  describe('Methods', () => {
    describe('addAdditionalMember', () => {
      it('should add new household member with same temporary address as primaryBeneficiary if sameAddress is true', () => {
        const h = new HouseholdCreate();
        h.primaryBeneficiary.currentAddress = mockCampGround();
        const expected = mockAdditionalMember();
        expected.currentAddress = mockCampGround();

        h.addAdditionalMember(mockAdditionalMember(), true);

        expect(h.additionalMembers).toEqual([expected]);
      });
      it('should add new household member with its own address if sameAddress is false', () => {
        const h = new HouseholdCreate();
        expect(h.additionalMembers).toEqual([]);

        h.addAdditionalMember(mockAdditionalMember(), false);

        expect(h.additionalMembers).toEqual([mockAdditionalMember()]);
      });
    });

    describe('removeAdditionalMember', () => {
      it('should remove household member at the specified index', () => {
        const h = new HouseholdCreate();
        h.addAdditionalMember(mockAdditionalMember(), false);

        h.removeAdditionalMember(0);

        expect(h.additionalMembers).toEqual([]);
      });
    });

    describe('editAdditionalMember', () => {
      it('should edit household member at the specified index', () => {
        const h = new HouseholdCreate();
        const edited = mockAdditionalMember();
        edited.identitySet.firstName = 'Test';
        h.addAdditionalMember(mockAdditionalMember(), false);
        h.editAdditionalMember(edited, 0, false);
        expect(h.additionalMembers[0].identitySet.firstName).toEqual(edited.identitySet.firstName);
      });

      it('should edit household member at the specified index and set temporary address is sameAddress is true', () => {
        const h = new HouseholdCreate();
        h.primaryBeneficiary.currentAddress = mockCampGround();
        const edited = mockAdditionalMember();
        edited.identitySet.firstName = 'Test';

        h.addAdditionalMember(mockAdditionalMember(), false);
        h.editAdditionalMember(edited, 0, true);

        expect(h.additionalMembers[0].identitySet.firstName).toEqual(edited.identitySet.firstName);
        expect(h.additionalMembers[0].currentAddress).toEqual(mockCampGround());
      });
    });

    describe('validate', () => {
      it('should call validate method from primaryBeneficiary', () => {
        const h = new HouseholdCreate();
        jest.spyOn(h.primaryBeneficiary, 'validate').mockImplementation(() => []);
        h.validate({ noFixedHome: false, skipAgeRestriction: false, skipEmailPhoneRules: false });
        expect(h.primaryBeneficiary.validate).toHaveBeenCalledTimes(1);
      });

      it('should call validate method from homeAddress', () => {
        const h = new HouseholdCreate();
        jest.spyOn(h.homeAddress, 'validate').mockImplementation(() => []);
        h.validate({ noFixedHome: false, skipAgeRestriction: false, skipEmailPhoneRules: false });
        expect(h.homeAddress.validate).toHaveBeenCalledTimes(1);
      });

      it('should call validateAdditionalMembers', () => {
        const h = new HouseholdCreate();
        jest.spyOn(h, 'validateAdditionalMembers').mockImplementation(() => []);
        h.validate({ noFixedHome: false, skipAgeRestriction: false, skipEmailPhoneRules: false });
        expect(h.validateAdditionalMembers).toHaveBeenCalledTimes(1);
      });

      it('should return an array with all errors', () => {
        const h = new HouseholdCreate();
        jest.spyOn(h.primaryBeneficiary, 'validate').mockImplementation(() => ['1']);
        jest.spyOn(h.homeAddress, 'validate').mockImplementation(() => ['2']);
        jest.spyOn(h, 'validateAdditionalMembers').mockImplementation(() => ['3']);
        const res = h.validate({ noFixedHome: false, skipAgeRestriction: false, skipEmailPhoneRules: false });
        expect(res).toEqual(['1', '2', '3']);
      });
    });

    describe('validateAddresses', () => {
      it('should call validate from primary beneficiary currentAddress', () => {
        const h = new HouseholdCreate();
        h.primaryBeneficiary = mockMember();
        jest.spyOn(h.primaryBeneficiary.currentAddress, 'validate').mockImplementation(() => []);
        h.validateAddresses(false);
        expect(h.primaryBeneficiary.currentAddress.validate).toHaveBeenCalledTimes(1);
      });

      it('with a fixed Address should call validate from homeAddress', () => {
        const h = new HouseholdCreate();
        h.homeAddress = mockAddress();
        jest.spyOn(h.homeAddress, 'validate').mockImplementation(() => []);
        h.validateAddresses(false);
        expect(h.homeAddress.validate).toHaveBeenCalledTimes(1);
      });

      it('with no fixed Address should not call validate from homeAddress', () => {
        const h = new HouseholdCreate();
        h.homeAddress = mockAddress();
        jest.spyOn(h.homeAddress, 'validate').mockImplementation(() => []);
        h.validateAddresses(true); // no home address
        expect(h.homeAddress.validate).not.toHaveBeenCalled();
      });
    });

    describe('validateAdditionalMembers', () => {
      it('should call validateIdentity with skipAgeRestriction and validateCurrentAddress ', () => {
        const h = new HouseholdCreate();
        h.additionalMembers = [mockAdditionalMember()];
        jest.spyOn(h.additionalMembers[0], 'validateIdentity').mockImplementation(() => []);
        jest.spyOn(h.additionalMembers[0], 'validateCurrentAddress').mockImplementation(() => []);
        h.validateAdditionalMembers();
        expect(h.additionalMembers[0].validateIdentity).toHaveBeenCalledTimes(1);
        expect(h.additionalMembers[0].validateIdentity).toHaveBeenCalledWith(true);
        expect(h.additionalMembers[0].validateCurrentAddress).toHaveBeenCalledTimes(1);
      });

      it('returns a flat array of all errors', () => {
        const h = new HouseholdCreate();
        h.additionalMembers = [mockAdditionalMember(), mockAdditionalMember()];
        jest.spyOn(h.additionalMembers[0], 'validateIdentity').mockImplementation(() => ['error1']);
        jest.spyOn(h.additionalMembers[1], 'validateCurrentAddress').mockImplementation(() => ['error2']);

        const res = h.validateAdditionalMembers();
        expect(res).toEqual(['error1', 'error2']);
      });
    });
  });
});
