import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockProvider } from '@/services/provider';
import { createUserAccount } from '../user-accounts/userAccountsHelpers';

import Component from './AddUserAccount.vue';

jest.mock('../user-accounts/userAccountsHelpers');
createUserAccount.mockImplementation(() => {});
const { pinia, userAccountStore } = useMockUserAccountStore();
const localVue = createLocalVue();
const services = mockProvider();

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
        expect(wrapper.vm.user.role).toEqual(
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

        expect(createUserAccount).toHaveBeenCalled();
      });
    });
  });
});
