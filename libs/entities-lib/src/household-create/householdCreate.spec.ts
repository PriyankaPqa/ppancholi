import {
  Address,
  HouseholdCreate,
  mockHouseholdCreate,
  mockHouseholdCreateData, mockCampGround,
  mockAdditionalMember,
  Member,
  mockMember,
  mockAddress, mockFriendsFamily, mockIdentitySet,
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
        crcUserName: '',
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

    describe('setPrimaryBeneficiary', () => {
      it('should set the payload as the primary beneficiary', () => {
        const h = new HouseholdCreate();
        h.setPrimaryBeneficiary(mockMember({ id: 'mock-primary-id' }));

        expect(h.primaryBeneficiary).toEqual(mockMember({ id: 'mock-primary-id' }));
      });
    });

    describe('setHomeAddress', () => {
      it('should set home address', () => {
        const h = new HouseholdCreate();
        h.setHomeAddress(mockAddress());
        expect(h.homeAddress).toEqual(mockAddress());
      });
    });

    describe('setCurrentAddress', () => {
      it('should set current address of primary beneficiary', () => {
        const h = new HouseholdCreate();
        h.setCurrentAddress(mockCampGround());
        expect(h.primaryBeneficiary.currentAddress).toEqual(mockCampGround());
      });
      it('should update current address of additional members if they have the same as primary', () => {
        const h = new HouseholdCreate();
        h.primaryBeneficiary.setCurrentAddress(mockFriendsFamily());
        h.addAdditionalMember(mockMember(), true);
        h.additionalMembers[0].setCurrentAddress(mockFriendsFamily());
        h.setCurrentAddress(mockCampGround());
        expect(h.additionalMembers[0].currentAddress).toEqual(mockCampGround());
      });
    });

    describe('isDuplicateMember', () => {
      it('returns false if the form does not contain all the data', () => {
        const h = new HouseholdCreate();
        expect(h.isDuplicateMember(mockIdentitySet({ firstName: null, lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }))).toBe(false);
        expect(h.isDuplicateMember(mockIdentitySet({ firstName: 'a', lastName: null, dateOfBirth: '1991-01-01T00:00:00Z' }))).toBe(false);
        expect(h.isDuplicateMember(mockIdentitySet({ firstName: 'a', lastName: 'b', dateOfBirth: null }))).toBe(false);
      });

      describe('test primary member', () => {
        it('returns false if it is calculated for primary member and there is no duplicate additional member in the household - different first name', () => {
          const h = new HouseholdCreate();
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'firstName', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });
          expect(h.isDuplicateMember(form, true)).toBe(false);
        });

        it('returns false if it is calculated for primary member and there is no duplicate additional member in the household - different last name', () => {
          const h = new HouseholdCreate();
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'a', lastName: 'lastName', dateOfBirth: '1991-01-01T00:00:00Z' });
          expect(h.isDuplicateMember(form, true)).toBe(false);
        });

        it('returns false if it is calculated for primary member and there is no duplicate additional member in the household - different birthdate', () => {
          const h = new HouseholdCreate();
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-02T00:00:00Z' });
          expect(h.isDuplicateMember(form, true)).toBe(false);
        });

        it('returns false if it is calculated for primary member and there is the same primary member already in the household', () => {
          const h = new HouseholdCreate();
          h.setPrimaryBeneficiary(mockMember({ identitySet: mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }));
          const form = mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });
          expect(h.isDuplicateMember(form, true)).toBe(false);
        });

        it('returns true if it is calculated for primary member and there is a duplicate additional member in the household', () => {
          const h = new HouseholdCreate();
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });
          expect(h.isDuplicateMember(form, true)).toBe(true);
        });
      });

      describe('test additional member', () => {
        it('returns false if there is no duplicate additional or primary member in the household', () => {
          const h = new HouseholdCreate();
          h.setPrimaryBeneficiary(mockMember({ identitySet: mockIdentitySet({ firstName: 'primary', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }));
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'new', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });

          expect(h.isDuplicateMember(form, false, 0)).toBe(false);
        });

        it('returns false if there is a duplicate additional member in the household at the same index', () => {
          const h = new HouseholdCreate();
          h.setPrimaryBeneficiary(mockMember({ identitySet: mockIdentitySet({ firstName: 'primary', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }));
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional1', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });

          expect(h.isDuplicateMember(form, false, 1)).toBe(false);
        });

        it('returns false if there is a duplicate additional member with the same memberId', () => {
          const h = new HouseholdCreate();
          h.setPrimaryBeneficiary(mockMember({ identitySet: mockIdentitySet({ firstName: 'primary', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }));
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional1', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          h.addAdditionalMember(mockMember({ id: 'additional2-id',
          identitySet: mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });

          expect(h.isDuplicateMember(form, false, 1, 'additional2-id')).toBe(false);
        });

        it('returns true if there is a duplicate additional member in the household at a different index', () => {
          const h = new HouseholdCreate();
          h.setPrimaryBeneficiary(mockMember({ identitySet: mockIdentitySet({ firstName: 'primary', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }));
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional1', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });

          expect(h.isDuplicateMember(form, false, 0)).toBe(true);
        });

        it('returns true if there is a duplicate primary member', () => {
          const h = new HouseholdCreate();
          h.setPrimaryBeneficiary(mockMember({ identitySet: mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }));
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional1', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          h.addAdditionalMember(mockMember({ identitySet: mockIdentitySet({ firstName: 'additional2', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' }) }), false);
          const form = mockIdentitySet({ firstName: 'a', lastName: 'a', dateOfBirth: '1991-01-01T00:00:00Z' });

          expect(h.isDuplicateMember(form, false, 0)).toBe(true);
        });
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
