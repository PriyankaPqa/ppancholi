import { createLocalVue, mount } from '@/test/testSetup';
import flushPromises from 'flush-promises';
import rolesAndPermissions from '../rolesAndPermissions';

const Component = {
  template: '<div></div>',
  computed: {
    can() {
      return this.$can('permissionA');
    },
    canAll() {
      return this.$canAll(['permissionA', 'permissionB']);
    },
    isRole() {
      return this.$isRole('admin');
    },
    hasRole() {
      return this.$hasRole('superadmin');
    },
    hasAllRoles() {
      return this.$hasAllRoles(['user', 'admin', 'superadmin']);
    },
  },
};

const localVue = createLocalVue();
localVue.use(rolesAndPermissions);

describe('Roles and Permissions plugin', () => {
  let store;
  let wrapper;
  beforeEach(async () => {
    wrapper = mount(Component, {
      localVue,
      store,
    });
  });

  describe('Plugin is correctly installed', () => {
    test('adds an $can method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$can).toBe('function');
    });
    test('adds an $canAll method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$canAll).toBe('function');
    });
    test('adds an $isRole method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$isRole).toBe('function');
    });
    test('adds an $hasRole method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$hasRole).toBe('function');
    });
    test('adds an $hasAllRoles method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$hasAllRoles).toBe('function');
    });
  });

  describe('Logic for each method', () => {
    describe('can method', () => {
      test('Return false if user does not have permission', () => {
        expect(wrapper.vm.can).toBe(false);
      });
      test('Return true if user have permission', async () => {
        wrapper.vm.$store.commit('user/setPermissions', {
          permissions: [{ name: 'permissionA' }],
        });
        await flushPromises();
        expect(wrapper.vm.can).toBe(true);
      });
    });

    describe('can all method', () => {
      test('Return false if user does not have all permissions', async () => {
        wrapper.vm.$store.commit('user/setPermissions', {
          permissions: [{ name: 'permissionA' }],
        });
        await flushPromises();
        expect(wrapper.vm.canAll).toBe(false);
      });
      test('Return true if user has all permission', async () => {
        wrapper.vm.$store.commit('user/setPermissions', {
          permissions: [{ name: 'permissionB' }, { name: 'permissionB' }],
        });
        await flushPromises();
        expect(wrapper.vm.canAll).toBe(true);
      });
    });

    describe('isRole method', () => {
      test('Return false if user does not the role currently', async () => {
        wrapper.vm.$store.commit('user/setCurrentRole', {
          role: {
            name: { value: { en: 'user', fr: 'user' } },
          },
        });
        await flushPromises();
        expect(wrapper.vm.isRole).toBe(false);
      });
      test('Return true if user has the role currently', async () => {
        wrapper.vm.$store.commit('user/setCurrentRole', {
          role: {
            name: { value: { en: 'admin', fr: 'admin' } },
          },
        });
        await flushPromises();
        expect(wrapper.vm.isRole).toBe(true);
      });
    });

    describe('hasRole method', () => {
      test('Return false if user does not have the role at all', async () => {
        wrapper.vm.$store.commit('user/setRoles', {
          roles: [
            {
              name: { value: { en: 'user', fr: 'user' } },
            },
            {
              name: { value: { en: 'admin', fr: 'admin' } },
            },
          ],
        });
        await flushPromises();
        expect(wrapper.vm.hasRole).toBe(false);
      });
      test('Return true if user has the role among his roles', async () => {
        wrapper.vm.$store.commit('user/setRoles', {
          roles: [
            {
              name: { value: { en: 'user', fr: 'user' } },
            },
            {
              name: { value: { en: 'admin', fr: 'admin' } },
            },
            {
              name: { value: { en: 'superadmin', fr: 'superadmin' } },
            },
          ],
        });
        await flushPromises();
        expect(wrapper.vm.hasRole).toBe(true);
      });
    });

    describe('hasAllRoles method', () => {
      test('Return false if user does not have all the roles specified', async () => {
        wrapper.vm.$store.commit('user/setRoles', {
          roles: [
            {
              name: { value: { en: 'user', fr: 'user' } },
            },
            {
              name: { value: { en: 'admin', fr: 'admin' } },
            },
          ],
        });
        await flushPromises();
        expect(wrapper.vm.hasAllRoles).toBe(false);
      });
      test('Return true if user has all the roles specified', async () => {
        wrapper.vm.$store.commit('user/setRoles', {
          roles: [
            {
              name: { value: { en: 'user', fr: 'user' } },
            },
            {
              name: { value: { en: 'admin', fr: 'admin' } },
            },
            {
              name: { value: { en: 'superadmin', fr: 'superadmin' } },
            },
          ],
        });
        await flushPromises();
        expect(wrapper.vm.hasAllRoles).toBe(true);
      });
    });
  });
});
