import { mockEvent } from './event.mock';

describe('>>> User', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const event = mockEvent();
      expect(event.id).toBe('7c076603-580a-4400-bef2-5ddececb0931');
    });

    it('should instantiate assistance number', () => {
      const event = mockEvent();
      expect(event.responseDetails.assistanceNumber).toBe('+15144544545');
    });

    it('should instantiate name', () => {
      const event = mockEvent();
      expect(event.name).toEqual({
        translation: {
          en: 'Gatineau Floods 2021',
          fr: 'Inondations Gatineau 2021',
        },
      });
    });

    it('should instantiate registration link', () => {
      const event = mockEvent();
      expect(event.registrationLink).toEqual({
        translation: {
          en: 'https://www.redcross.ca/gatineau-floods-2021',
          fr: 'https://www.redcross.ca/inondations-gatineau-2021',
        },
      });
    });

    it('should instantiate tenantId', () => {
      const event = mockEvent();
      expect(event.tenantId).toEqual(mockEvent().tenantId);
    });
  });
});
