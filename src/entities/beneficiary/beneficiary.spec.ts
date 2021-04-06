import {
  Address,
  Beneficiary, ContactInformation, HouseholdMembers, mockBeneficiary, mockBeneficiaryData, Person,
} from '@/entities/beneficiary';

describe('>>> Person', () => {
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
      expect(b.householdMembers).toEqual(new HouseholdMembers());
    });
  });
});
