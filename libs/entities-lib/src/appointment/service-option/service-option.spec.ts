import { Status } from '@libs/shared-lib/types';
import { ServiceOption } from './service-option';
import { mockServiceOption } from './service-option.mock';

const mockData = mockServiceOption();

  describe('>>> ServiceOption', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new ServiceOption(mockData);

          expect(item.serviceOptionType).toEqual(mockData.serviceOptionType);
          expect(item.appointmentModalities).toEqual(mockData.appointmentModalities);
          expect(item.serviceOptionStatus).toEqual(mockData.serviceOptionStatus);
        });

        it('should instantiate on empty', () => {
          const item = new ServiceOption();

          expect(item.serviceOptionType).toEqual({ optionItemId: null, specifiedOther: null });
          expect(item.appointmentModalities).toEqual([]);
          expect(item.serviceOptionStatus).toEqual(Status.Active);
        });
      });
    });
});
