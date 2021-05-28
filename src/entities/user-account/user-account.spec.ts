import { UserAccount } from './user-account';
import { mockUserAccountSearchData } from './user-account.mock';

const mockUserAccountData = mockUserAccountSearchData()[0];

describe('>>> User Account', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.id).toBe(mockUserAccountData.userAccountId);
    });

    it('should instantiate firstName', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.firstName).toBe(mockUserAccountData.givenName);
    });

    it('should instantiate lastName', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.lastName).toBe(mockUserAccountData.surname);
    });

    it('should instantiate displayName', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.displayName).toBe(mockUserAccountData.displayName);
    });

    it('should instantiate email', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.email).toEqual(mockUserAccountData.emailAddress);
    });

    it('should instantiate phoneNumber', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.phoneNumber).toEqual(mockUserAccountData.phoneNumber);
    });

    it('should instantiate roleId', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.roleId).toEqual(mockUserAccountData.roleId);
    });

    it('should instantiate roleName', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.roleName).toEqual(mockUserAccountData.roleName);
    });

    it('should instantiate accountStatus', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.accountStatus).toEqual(mockUserAccountData.accountStatus);
    });

    it('should instantiate userAccountStatus', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.status).toEqual(mockUserAccountData.userAccountStatus);
    });

    it('should instantiate filters', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.filters).toEqual(mockUserAccountData.filters);
    });

    it('should instantiate tenantId', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.tenantId).toEqual(mockUserAccountData.tenantId);
    });

    it('should instantiate teamCount', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.teamCount).toEqual(mockUserAccountData.teamCount);
    });

    it('should instantiate caseFilesCount', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.caseFilesCount).toEqual(mockUserAccountData.caseFilesCount);
    });

    it('should instantiate openCaseFilesCount', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.openCaseFilesCount).toEqual(mockUserAccountData.openCaseFilesCount);
    });

    it('should instantiate inactiveCaseFilesCount', () => {
      const user = new UserAccount(mockUserAccountData);
      expect(user.inactiveCaseFilesCount).toEqual(mockUserAccountData.inactiveCaseFilesCount);
    });
  });
});
