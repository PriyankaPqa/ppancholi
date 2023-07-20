import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';

import { mockProvider } from '@/services/provider';
import { mockServerError, mockHttpError } from '@libs/services-lib/src/http-client';
import Component from './AddUserAccount.vue';

const { pinia, userAccountStore } = useMockUserAccountStore();
const localVue = createLocalVue();
const services = mockProvider();

const mockSubRole = {
  id: '123',
  name: {
    translation: {
      en: 'case worker 2',
      fr: 'case worker 2 fr',
    },
  },
};

const testUserData = {
  entity: {
    id: '1',
    status: 1,
  },
  metadata: {
    id: '1',
    displayName: 'C',
    givenName: 'Some Person',
    surname: '',
    emailAddress: 'fake@email.com',
    phoneNumber: '123-456-7890',
  },
};

const optionData = [
  {
    id: '1',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
    name: {
      translation: {
        en: 'Z',
        fr: 'Inundation',
      },
    },
    subitems: [
      {
        id: '123',
        name: {
          translation: {
            en: 'case worker 2',
            fr: 'case worker 2 fr',
          },
        },
      },
    ],
  }, {
    id: '2',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
    name: {
      translation: {
        en: 'A',
        fr: 'Incendies',
      },
    },
    subitems: [
      {
        id: '456',
        name: {
          translation: {
            en: 'case worker 3',
            fr: 'case worker 3 fr',
          },
        },
      },
    ],
  },
];

let wrapper;

const doMount = (shallow = true, otherOptions = {}) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      show: true,
      allSubRoles: [...optionData[0].subitems, ...optionData[1].subitems],
      allAccessLevelRoles: [],
    },
    data() {
      return {
        searchTerm: '',
        filteredActiveDirectoryUsers: [],
        filteredAppUsers: [],
        selectedUsers: [],
        loading: false,
        isSubmitAllowed: false,
      };
    },
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };
  if (shallow) {
    wrapper = shallowMount(Component, options);
  } else {
    wrapper = mount(Component, options);
  }
};

describe('AddUserAccount.vue', () => {
  describe('Computed', () => {
    describe('rules', () => {
      it('should return correct rules', () => {
        doMount();
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_MD,
          },
          email: {
            required: true,
            email: true,
            max: MAX_LENGTH_MD,
          },
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => doMount());

    describe('close', () => {
      it('emit update:show with false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0]).toEqual([false]);
      });
    });

    describe('onRoleSelected', () => {
      it('updates user with correct role and enables submit button', () => {
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        expect(wrapper.vm.user.roles[0]).toEqual(
          {
            id: optionData[0].id,
            displayName: optionData[0].name.translation.en,
            value: null,
          },
        );
        expect(wrapper.vm.isSubmitAllowed).toBeTruthy();
      });
    });

    describe('submit', () => {
      it('should not run if submit button is disabled', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.isSubmitAllowed = false;
        await wrapper.vm.submit();
        expect(userAccountStore.createUserAccount).not.toHaveBeenCalled();
      });

      it('should not run if form is invalid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        wrapper.vm.isSubmitAllowed = true;
        await wrapper.vm.submit();
        expect(userAccountStore.createUserAccount).not.toHaveBeenCalled();
      });

      it('should call createUserAccount when the form is valid', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.createUserAccount = jest.fn();
        await wrapper.vm.submit();

        expect(wrapper.vm.createUserAccount).toHaveBeenCalled();
      });

      it('emits users-added on success', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.createUserAccount = jest.fn(() => true);
        await wrapper.vm.submit();
        wrapper.vm.$nextTick();

        expect(wrapper.emitted('users-added')).toBeTruthy();
      });

      it('does not emit users-added on failure', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.createUserAccount = jest.fn(() => false);
        await wrapper.vm.submit();
        wrapper.vm.$nextTick();

        expect(wrapper.emitted('users-added')).toBeFalsy();
      });
    });

    describe('getSubRoleById', () => {
      it('retrieves the correct sub-role from a user', async () => {
        const user = testUserData;
        user.roleId = wrapper.vm.allSubRoles[0].id;
        expect(wrapper.vm.getSubRoleById(user.roleId)).toEqual(wrapper.vm.allSubRoles[0]);
      });
    });

    describe('createUserAccount', () => {
      it('should call services correctly', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        userAccountStore.createUserAccount = jest.fn(() => testUserData);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        await wrapper.vm.createUserAccount(wrapper.vm.user);

        expect(userAccountStore.createUserAccount).toHaveBeenCalled();
      });

      it('opens the correct toast on success', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        userAccountStore.createUserAccount = jest.fn(() => testUserData);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        await wrapper.vm.createUserAccount(wrapper.vm.user);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalled();
      });

      it('opens the correct toast on failure', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        userAccountStore.createUserAccount = jest.fn(() => null);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        await wrapper.vm.createUserAccount(wrapper.vm.user);

        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalled();
      });

      it('opens the correct toast on exception', async () => {
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.onRoleSelected(roleData);
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        userAccountStore.createUserAccount = jest.fn(() => Promise.reject(mockServerError([mockHttpError({ code: 'system_management.add_users.error' })])));
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        await wrapper.vm.createUserAccount(wrapper.vm.user);

        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('system_management.add_users.error');
      });
    });
  });
});
