import { mockPotentialDuplicateEntity, PotentialDuplicateEntity } from './index';

const mockData = mockPotentialDuplicateEntity();

describe('>>> Potential duplicate ', () => {
  describe('>> constructor', () => {
    describe('>> instantiate when data is passed', () => {
      it('should instantiate householdIds', () => {
        const potentialDuplicate = new PotentialDuplicateEntity(mockData);
        expect(potentialDuplicate.householdIds).toEqual(mockData.householdIds);
      });

      it('should instantiate duplicateReasons', () => {
        const potentialDuplicate = new PotentialDuplicateEntity(mockData);
        expect(potentialDuplicate.duplicateReasons).toEqual(mockData.duplicateReasons);
      });

      it('should instantiate duplicateStatusHistory', () => {
        const potentialDuplicate = new PotentialDuplicateEntity(mockData);
        expect(potentialDuplicate.duplicateStatusHistory).toEqual(mockData.duplicateStatusHistory);
      });

      it('should instantiate memberFirstName', () => {
        const potentialDuplicate = new PotentialDuplicateEntity(mockData);
        expect(potentialDuplicate.memberFirstName).toEqual(mockData.memberFirstName);
      });

      it('should instantiate memberLastName', () => {
        const potentialDuplicate = new PotentialDuplicateEntity(mockData);
        expect(potentialDuplicate.memberLastName).toEqual(mockData.memberLastName);
      });
    });

    describe('>> instantiate when data is not passed', () => {
      it('should instantiate householdIds', () => {
        const potentialDuplicate = new PotentialDuplicateEntity();
        expect(potentialDuplicate.householdIds).toEqual([]);
      });

      it('should instantiate duplicateReasons', () => {
        const potentialDuplicate = new PotentialDuplicateEntity();
        expect(potentialDuplicate.duplicateReasons).toEqual([]);
      });

      it('should instantiate duplicateStatusHistory', () => {
        const potentialDuplicate = new PotentialDuplicateEntity();
        expect(potentialDuplicate.duplicateStatusHistory).toEqual(null);
      });

      it('should instantiate memberFirstName', () => {
        const potentialDuplicate = new PotentialDuplicateEntity();
        expect(potentialDuplicate.memberFirstName).toEqual(null);
      });

      it('should instantiate memberLastName', () => {
        const potentialDuplicate = new PotentialDuplicateEntity();
        expect(potentialDuplicate.memberLastName).toEqual(null);
      });
    });
  });
});
