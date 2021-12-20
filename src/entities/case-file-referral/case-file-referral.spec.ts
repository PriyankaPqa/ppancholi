/**
 * @group entities
 */

import { ReferralMethod } from './case-file-referral.types';
import {
  mockCaseFileReferralEntity, CaseFileReferralEntity,
} from './index';

const mockData = mockCaseFileReferralEntity();

describe('>>> Case File', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate name', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });

      it('should instantiate note', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.note).toEqual(mockData.note);
      });

      it('should instantiate method', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.method).toEqual(mockData.method);
      });

      it('should instantiate type', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.type).toEqual(mockData.type);
      });

      it('should instantiate outcomeStatus', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.outcomeStatus).toEqual(mockData.outcomeStatus);
      });

      it('should instantiate name', () => {
        const item = new CaseFileReferralEntity(mockData);
        expect(item.name).toEqual(mockData.name);
      });

      it('should instantiate referralConsentInformation', () => {
        const mockData = mockCaseFileReferralEntity();
        mockData.referralConsentInformation = null;
        let item = new CaseFileReferralEntity(mockData);
        expect(item.referralConsentInformation).toEqual(null);
        // eslint-disable-next-line
        mockData.referralConsentInformation = { crcUserId: 'crcUserId', crcUserName: 'uName', dateTimeConsent: '2020/01/10' as any };
        item = new CaseFileReferralEntity(mockData);
        expect(item.referralConsentInformation).toEqual({ crcUserId: 'crcUserId', crcUserName: 'uName', dateTimeConsent: new Date('2020/01/10') });
      });

      it('should default method to Referral', () => {
        const item = new CaseFileReferralEntity();
        expect(item.method).toEqual(ReferralMethod.Referral);
      });

      it('should default type to an object', () => {
        const item = new CaseFileReferralEntity();
        expect(item.type).not.toBeNull();
      });
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const item = new CaseFileReferralEntity(mockData);
      expect(item.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('case file id is required', () => {
        const item = new CaseFileReferralEntity(mockData);
        item.caseFileId = null;
        expect(item.validate()).toContain('The case file id is required');
      });

      test('The name is required', () => {
        const item = new CaseFileReferralEntity(mockData);
        item.name = null;
        expect(item.validate()).toContain('The name is required');
      });
    });
  });
});
