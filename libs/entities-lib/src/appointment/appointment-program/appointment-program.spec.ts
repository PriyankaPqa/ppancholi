import { AppointmentProgram } from './appointment-program';
import { mockAppointmentProgram } from './appointment-program.mock';
import { AppointmentProgramStatus } from './appointment-program.types';
import utils from '../../utils';

const mockData = mockAppointmentProgram();

  describe('>>> AppointmentProgram', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new AppointmentProgram(mockData);

          expect(item.eventId).toEqual(mockData.eventId);
          expect(item.name).toEqual(mockData.name);
          expect(item.timeZone).toEqual(mockData.timeZone);
          expect(item.businessHours).toEqual(mockData.businessHours);
          expect(item.serviceOptions).toEqual(mockData.serviceOptions);
          expect(item.appointmentProgramStatus).toEqual(mockData.appointmentProgramStatus);
          expect(item.emailConfirmationSubject).toEqual(mockData.emailConfirmationSubject);
          expect(item.emailConfirmationMessage).toEqual(mockData.emailConfirmationMessage);
        });

        it('should instantiate on empty', () => {
          const item = new AppointmentProgram();

          expect(item.eventId).toEqual(null);
          expect(item.name).toEqual({ translation: { en: '', fr: '' } });
          expect(item.timeZone).toEqual(null);
          expect(item.businessHours).toEqual([]);
          expect(item.serviceOptions).toEqual([]);
          expect(item.appointmentProgramStatus).toEqual(AppointmentProgramStatus.Active);
          expect(item.emailConfirmationSubject).toEqual({ translation: { en: '', fr: '' } });
          expect(item.emailConfirmationMessage).toEqual({ translation: { en: '', fr: '' } });
        });
      });
});
    describe('fillEmptyMultilingualAttributes', () => {
      it('calls utils.getFilledMultilingualField and assigns the result to the right fields', async () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-value-en' } }));
        const item = new AppointmentProgram();
        item.fillEmptyMultilingualAttributes();
        expect(utils.getFilledMultilingualField).toBeCalledTimes(3);
        expect(item.name).toEqual({ translation: { en: 'mock-value-en' } });
        expect(item.emailConfirmationSubject).toEqual({ translation: { en: 'mock-value-en' } });
        expect(item.emailConfirmationMessage).toEqual({ translation: { en: 'mock-value-en' } });
        spy.mockRestore();
      });
    });
});
