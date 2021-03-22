import { PrivacyStatement } from './privacyStatement';

describe('>>> PrivacyStatement', () => {
  describe('>> constructor', () => {
    it('should instantiate isPrivacyAgreed', () => {
      const p = new PrivacyStatement();
      expect(p.isPrivacyAgreed).toBeFalsy();
    });

    it('should instantiate privacyDateTimeConsent', () => {
      const p = new PrivacyStatement();
      expect(p.privacyDateTimeConsent).not.toBeUndefined();
    });
  });

  describe('>> validation', () => {
    test('privacy statement is required', () => {
      const p = new PrivacyStatement();
      let results = p.validate();
      expect(results).toContain('privacy statement is required');

      p.isPrivacyAgreed = true;
      results = p.validate();
      expect(results).not.toContain('privacy statement is required');
    });
  });
});
