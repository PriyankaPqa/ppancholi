import {
  Address,
  Beneficiary,
  ContactInformation,
  mockBeneficiary,
  mockBeneficiaryData, mockCampGround,
  mockHouseholdMember,
  Person,
} from '@/entities/beneficiary';

describe('>>> Beneficiary', () => {
  describe('>>constructor', () => {
    it('should initialize data if passed', () => {
      const b = new Beneficiary(mockBeneficiaryData());
      expect(b).toEqual(mockBeneficiary());
    });

    it('should reset if not data pass', () => {
      const b = new Beneficiary();
      expect(b.person).toEqual(new Person());
      expect(b.contactInformation).toEqual(new ContactInformation());
      expect(b.homeAddress).toEqual(new Address());
      expect(b.householdMembers).toEqual([]);
    });
  });

  describe('Methods', () => {
    describe('addHouseholdMember', () => {
      it('should add new household member with same  temporary address as beneficiary if sameAddress is true', () => {
        const b = new Beneficiary();
        b.person.temporaryAddress = mockCampGround();
        const expected = mockHouseholdMember();
        expected.temporaryAddress = mockCampGround();

        b.addHouseholdMember(mockHouseholdMember(), true);

        expect(b.householdMembers).toEqual([expected]);
      });
      it('should add new household member with its own address if sameAddress is false', () => {
        const b = new Beneficiary();
        expect(b.householdMembers).toEqual([]);

        b.addHouseholdMember(mockHouseholdMember(), false);

        expect(b.householdMembers).toEqual([mockHouseholdMember()]);
      });
    });

    describe('removeHouseholdMember', () => {
      it('should remove household member at the specified index', () => {
        const b = new Beneficiary();
        b.addHouseholdMember(mockHouseholdMember(), false);

        b.removeHouseholdMember(0);

        expect(b.householdMembers).toEqual([]);
      });
    });

    describe('editHouseholdMember', () => {
      it('should edit household member at the specified index', () => {
        const b = new Beneficiary();
        const edited = mockHouseholdMember();
        edited.firstName = 'Test';
        b.addHouseholdMember(mockHouseholdMember(), false);
        b.editHouseholdMember(edited, 0, false);
        expect(b.householdMembers[0].firstName).toEqual(edited.firstName);
      });

      it('should edit household member at the specified index and set temporary address is sameAddress is true', () => {
        const b = new Beneficiary();
        b.person.temporaryAddress = mockCampGround();
        const edited = mockHouseholdMember();
        edited.firstName = 'Test';

        b.addHouseholdMember(mockHouseholdMember(), false);
        b.editHouseholdMember(edited, 0, true);

        expect(b.householdMembers[0].firstName).toEqual(edited.firstName);
        expect(b.householdMembers[0].temporaryAddress).toEqual(mockCampGround());
      });
    });

    describe('validate', () => {
      it('should call validate method from Person', () => {
        const b = new Beneficiary();
        jest.spyOn(b.person, 'validate').mockImplementation(() => []);
        b.validate();
        expect(b.person.validate).toHaveBeenCalledTimes(1);
      });

      it('should call validate method from contactInformation', () => {
        const b = new Beneficiary();
        jest.spyOn(b.contactInformation, 'validate').mockImplementation(() => []);
        b.validate();
        expect(b.contactInformation.validate).toHaveBeenCalledTimes(1);
      });

      it('should call validate method from homeAddress', () => {
        const b = new Beneficiary();
        jest.spyOn(b.homeAddress, 'validate').mockImplementation(() => []);
        b.validate();
        expect(b.homeAddress.validate).toHaveBeenCalledTimes(1);
      });

      it('should call validateHouseholdMembers', () => {
        const b = new Beneficiary();
        jest.spyOn(b, 'validateHouseholdMembers').mockImplementation(() => []);
        b.validate();
        expect(b.validateHouseholdMembers).toHaveBeenCalledTimes(1);
      });

      it('should return an array with all errors', () => {
        const b = new Beneficiary();
        jest.spyOn(b.person, 'validate').mockImplementation(() => ['1']);
        jest.spyOn(b.contactInformation, 'validate').mockImplementation(() => ['2']);
        jest.spyOn(b.homeAddress, 'validate').mockImplementation(() => ['3']);
        jest.spyOn(b, 'validateHouseholdMembers').mockImplementation(() => ['4']);
        const res = b.validate();
        expect(res).toEqual(['1', '2', '3', '4']);
      });
    });

    describe('validateHouseholdMembers', () => {
      it('should call validate from Person with skipAgeRestriction', () => {
        const b = new Beneficiary();
        b.householdMembers = [mockHouseholdMember()];
        jest.spyOn(b.householdMembers[0], 'validate').mockImplementation(() => []);
        b.validateHouseholdMembers();
        expect(b.householdMembers[0].validate).toHaveBeenCalledTimes(1);
        expect(b.householdMembers[0].validate).toHaveBeenCalledWith(true);
      });

      it('returns a flat array of all errors', () => {
        const b = new Beneficiary();
        b.householdMembers = [mockHouseholdMember(), mockHouseholdMember()];
        jest.spyOn(b.householdMembers[0], 'validate').mockImplementation(() => ['error1']);
        jest.spyOn(b.householdMembers[1], 'validate').mockImplementation(() => ['error2']);

        const res = b.validateHouseholdMembers();
        expect(res).toEqual(['error1', 'error2']);
      });
    });
  });
});
