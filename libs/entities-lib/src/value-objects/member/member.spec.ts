import { IdentitySet } from '@/value-objects/identity-set';
import { ContactInformation } from '@/value-objects/contact-information';
import { CurrentAddress, mockCampGround } from '../current-address';
import { mockMember } from './member.mock';
import { Member } from './member';

describe('Member', () => {
  describe('constructor', () => {
    it('should initialize data if passed', () => {
      const p = new Member(mockMember());
      expect(p).toEqual(mockMember());
    });

    it('should reset if not data pass', () => {
      const p = new Member();
      expect(p.identitySet).toEqual(new IdentitySet());
      expect(p.currentAddress).toEqual(new CurrentAddress());
      expect(p.contactInformation).toEqual(new ContactInformation());
    });
  });

  describe('Methods', () => {
    describe('validateCurrentAddress', () => {
      it('should return results of validate of currentAddress', () => {
        const p = new Member();
        const results = p.currentAddress.validate();
        expect(p.validateCurrentAddress()).toEqual(results);
      });
    });

    describe('validateIdentity', () => {
      it('should return results of validate of identitySet', () => {
        const p = new Member();
        const results = p.identitySet.validate();
        expect(p.validateIdentity(false)).toEqual(results);
      });
    });

    describe('validateContactInformation', () => {
      it('should return results of validate of contactInformation', () => {
        const p = new Member();
        const results = p.contactInformation.validate(false);
        expect(p.validateContactInformation(false)).toEqual(results);
      });
    });

    describe('validate', () => {
      it('should return results of identity + currentAddress + contactInformation', () => {
        const p = new Member();
        const res = p.validate();
        expect(res).toEqual([
          ...p.validateIdentity(false),
          ...p.validateCurrentAddress(),
          ...p.validateContactInformation(false),
        ]);
      });
    });

    describe('setCurrentAddress', () => {
      it('should set the current address', () => {
        const p = new Member();
        p.setCurrentAddress(mockCampGround());
        expect(p.currentAddress).toEqual(mockCampGround());
      });
    });
  });
});
