import { isTemporaryBranch } from './temporary-branch';

describe('isTemporaryBranch', () => {
  it('should return false if TEMP_BRANCH_ID has value #{VITE_TEMP_BRANCH_ID}#', () => {
    expect(isTemporaryBranch('#{VITE_TEMP_BRANCH_ID}#')).toBe(false);
  });

  it('should return false if TEMP_BRANCH_ID is empty string', () => {
    expect(isTemporaryBranch('')).toBe(false);
  });

  it('should return false if TEMP_BRANCH_ID is undefined', () => {
    expect(isTemporaryBranch(undefined)).toBe(false);
  });
  it('should return true if TEMP_BRANCH_ID has a value', () => {
    expect(isTemporaryBranch('6555')).toBe(true);
  });
});
