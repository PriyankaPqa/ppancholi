import { ServiceOption } from './service-option';
import { mockServiceOption } from './service-option.mock';

const mockData = mockServiceOption();

  describe('>>> ServiceOption', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new ServiceOption(mockData);

          expect(item.type).toEqual(mockData.type);
          expect(item.appointmentModalities).toEqual(mockData.appointmentModalities);
        });

        it('should instantiate on empty', () => {
          const item = new ServiceOption();

          expect(item.type).toEqual(null);
          expect(item.appointmentModalities).toEqual([]);
        });
      });
    });
});
