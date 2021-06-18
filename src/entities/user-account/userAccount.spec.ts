import {
  mockUserAccountEntity, UserAccountEntity, AccountStatus, IFilter,
} from './index';

const mock = mockUserAccountEntity();

describe('>>> UserAccountEntity', () => {
  describe('>> constructor', () => {
    describe('if data is passed', () => {
      it('should instantiate accountStatus', () => {
        const entity = new UserAccountEntity(mock);
        expect(entity.accountStatus).toBe(mock.accountStatus);
      });

      it('should instantiate filters', () => {
        const expected = mock.filters.map((f: IFilter) => ({
          ...f,
          criteria: f.criteria.map((c: string) => JSON.parse(c)),
        }));
        const entity = new UserAccountEntity(mock);
        expect(entity.filters).toEqual(expected);
      });

      it('should instantiate roles', () => {
        const entity = new UserAccountEntity(mock);
        expect(entity.roles).toBe(mock.roles);
      });

      it('should instantiate accessLevels', () => {
        const entity = new UserAccountEntity(mock);
        expect(entity.accessLevels).toBe(mock.accessLevels);
      });
    });

    describe('if not data is passed', () => {
      it('should instantiate accountStatus', () => {
        const entity = new UserAccountEntity();
        expect(entity.accountStatus).toBe(AccountStatus.None);
      });

      it('should instantiate filters', () => {
        const entity = new UserAccountEntity();
        expect(entity.filters).toEqual([]);
      });

      it('should instantiate roles', () => {
        const entity = new UserAccountEntity();
        expect(entity.roles).toEqual([]);
      });

      it('should instantiate accessLevels', () => {
        const entity = new UserAccountEntity();
        expect(entity.accessLevels).toBe(null);
      });
    });
  });
});
