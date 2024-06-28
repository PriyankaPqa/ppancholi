import { ServiceOption } from './service-option';
import { mockServiceOption } from './service-option.mock';

const mockData = mockServiceOption();

  describe('>>> ServiceOption', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new ServiceOption(mockData);

          expect(item.name).toEqual(mockData.name);
          expect(item.duration).toEqual(mockData.duration);
          expect(item.emailConfirmationSubject).toEqual(mockData.emailConfirmationSubject);
          expect(item.emailConfirmationContent).toEqual(mockData.emailConfirmationContent);
          expect(item.appointmentModalities).toEqual(mockData.appointmentModalities);
        });

        it('should instantiate on empty', () => {
          const item = new ServiceOption();

          expect(item.name).toEqual(null);
          expect(item.duration).toEqual(null);
          expect(item.emailConfirmationSubject).toEqual(null);
          expect(item.emailConfirmationContent).toEqual(null);
          expect(item.appointmentModalities).toEqual([]);
        });
      });
    });
});
