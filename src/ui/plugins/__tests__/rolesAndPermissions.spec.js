import { createLocalVue } from '@/test/testSetup';
import rolesAndPermissions from '../rolesAndPermissions';

const localVue = createLocalVue();
localVue.use(rolesAndPermissions);

describe('Roles and Permissions plugin', () => {
  describe('Plugin is correctly installed', () => {
    test('adds an $hasLevel method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$hasLevel).toBe('function');
    });
    test('adds an $hasRole method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$hasRole).toBe('function');
    });
  });
});
