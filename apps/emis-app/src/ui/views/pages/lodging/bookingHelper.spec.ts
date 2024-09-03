import { LodgingMode, isEditMode, modeMayTriggerPayment } from './bookingHelper';

describe('bookingHelper', () => {
  describe('isEditMode', () => {
    it('should return according to mode', async () => {
      expect(isEditMode(LodgingMode.BookingMode)).toEqual(false);
      expect(isEditMode(LodgingMode.ExtendStay)).toEqual(true);
      expect(isEditMode(LodgingMode.EditCrcProvidedAsLodging)).toEqual(true);
      expect(isEditMode(LodgingMode.EditCrcProvidedAsNonLodging)).toEqual(true);
      expect(isEditMode(LodgingMode.EditNotCrcProvided)).toEqual(true);
      expect(isEditMode(LodgingMode.MoveCrcProvidedAllowed)).toEqual(false);
      expect(isEditMode(LodgingMode.MoveCrcProvidedNotAllowed)).toEqual(false);
    });
  });

  describe('modeMayTriggerPayment', () => {
    it('should return according to mode', async () => {
      expect(modeMayTriggerPayment(LodgingMode.BookingMode)).toEqual(true);
      expect(modeMayTriggerPayment(LodgingMode.ExtendStay)).toEqual(true);
      expect(modeMayTriggerPayment(LodgingMode.EditCrcProvidedAsLodging)).toEqual(false);
      expect(modeMayTriggerPayment(LodgingMode.EditCrcProvidedAsNonLodging)).toEqual(false);
      expect(modeMayTriggerPayment(LodgingMode.EditNotCrcProvided)).toEqual(false);
      expect(modeMayTriggerPayment(LodgingMode.MoveCrcProvidedAllowed)).toEqual(true);
      expect(modeMayTriggerPayment(LodgingMode.MoveCrcProvidedNotAllowed)).toEqual(false);
    });
  });
});
