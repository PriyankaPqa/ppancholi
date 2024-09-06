import { useMockTaskStore } from '@/pinia/task/task.mock';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import bookingHelper, { LodgingMode } from './bookingHelper';

const { taskStore } = useMockTaskStore();
describe('bookingHelper', () => {
  describe('isEditMode', () => {
    it('should return according to mode', async () => {
      expect(bookingHelper.isEditMode(LodgingMode.BookingMode)).toEqual(false);
      expect(bookingHelper.isEditMode(LodgingMode.ExtendStay)).toEqual(true);
      expect(bookingHelper.isEditMode(LodgingMode.EditCrcProvidedAsLodging)).toEqual(true);
      expect(bookingHelper.isEditMode(LodgingMode.EditCrcProvidedAsNonLodging)).toEqual(true);
      expect(bookingHelper.isEditMode(LodgingMode.EditNotCrcProvided)).toEqual(true);
      expect(bookingHelper.isEditMode(LodgingMode.MoveCrcProvidedAllowed)).toEqual(false);
      expect(bookingHelper.isEditMode(LodgingMode.MoveCrcProvidedNotAllowed)).toEqual(false);
    });
  });

  describe('modeMayTriggerPayment', () => {
    it('should return according to mode', async () => {
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.BookingMode)).toEqual(true);
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.ExtendStay)).toEqual(true);
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.EditCrcProvidedAsLodging)).toEqual(false);
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.EditCrcProvidedAsNonLodging)).toEqual(false);
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.EditNotCrcProvided)).toEqual(false);
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.MoveCrcProvidedAllowed)).toEqual(true);
      expect(bookingHelper.modeMayTriggerPayment(LodgingMode.MoveCrcProvidedNotAllowed)).toEqual(false);
    });
  });

  describe('checkLodgingTaskExists', () => {
    it('should return according to task category existing', async () => {
      taskStore.fetchTaskCategories = jest.fn(() => [mockOptionItem({ isLodging: true })]);
      const vue = { $message: jest.fn(), $t: jest.fn() } as any;
      expect(await bookingHelper.checkLodgingTaskExists(vue)).toEqual(true);
      expect(vue.$message).not.toHaveBeenCalled();

      taskStore.fetchTaskCategories = jest.fn(() => [mockOptionItem({ isLodging: false })]);
      expect(await bookingHelper.checkLodgingTaskExists(vue)).toEqual(false);
      expect(vue.$message).toHaveBeenCalled();
    });
  });
});
