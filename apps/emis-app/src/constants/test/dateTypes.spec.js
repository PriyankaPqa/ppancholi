import { dateTypes } from '@/constants/dateTypes';

describe('dateTypes', () => {
  describe('getType', () => {
    it('should throw an error if getType is called with an empty string', () => {
      expect(() => {
        dateTypes.getType('');
      }).toThrow('Please enter a proper date field name');
    });

    it('should throw an error if getType is called with a date field name not on the list', () => {
      expect(() => {
        dateTypes.getType('randomName');
      }).toThrow('Please enter a proper date field name');
    });
  });
});
