import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import routes from '@/constants/routes';
import Component from './AddRemoveTeamMembersMassActionCreate.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('AddRemoveTeamMembersMassActionCreate.vue', () => {
  let wrapper;
  const doMount = (options) => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $services: services,
      },
      ...options,
    });
  };
  beforeEach(() => {
    doMount();
  });

  describe('Computed', () => {
    describe('title', () => {
      it('should return proper data when action is add', () => {
        doMount({
          mocks: {
            $services: services,
            $route: {
              query: {
                action: 'add',
              },
            },
          },
        });
        expect(wrapper.vm.title).toEqual('massAction.addRemoveTeamMembers.create.title.add');
      });

      it('should return proper data when action is remove', () => {
        doMount({
          mocks: {
            $services: services,
            $route: {
              query: {
                action: 'remove',
              },
            },
          },
        });
        expect(wrapper.vm.title).toEqual('massAction.addRemoveTeamMembers.create.title.remove');
      });
    });

    describe('uploadUrl', () => {
      it('should return proper data when action is add', () => {
        doMount({
          mocks: {
            $services: services,
            $route: {
              query: {
                action: 'add',
              },
            },
          },
        });
        expect(wrapper.vm.uploadUrl).toEqual('case-file/mass-actions/add-team-members');
      });

      it('should return proper data when action is remove', () => {
        doMount({
          mocks: {
            $services: services,
            $route: {
              query: {
                action: 'remove',
              },
            },
          },
        });
        expect(wrapper.vm.uploadUrl).toEqual('case-file/mass-actions/remove-team-members');
      });
    });
  });

  describe('Methods', () => {
    describe('back', () => {
      it('should call $router replace method with correct data', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.massActions.addRemoveTeamMembers.home.name });
      });
    });

    describe('back', () => {
      it('should call $router replace method with correct data', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.massActions.addRemoveTeamMembers.home.name });
      });
    });

    describe('onSuccess', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.onSuccess({ id: '1' });
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.addRemoveTeamMembers.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onUploadStart', () => {
      it('should add the payment details to the form data', async () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.$refs.base.upload = jest.fn();

        const form = {
          teamId: 'team-id-1',
        };
        await wrapper.setData({ form });
        wrapper.vm.formData.set = jest.fn();
        await wrapper.vm.onUploadStart();

        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('teamId', 'team-id-1');
      });

      it('should call upload method of the child', () => {
        const form = {
          teamId: 'team-id-1',
        };
        wrapper.vm.form = form;

        wrapper.vm.$refs.base.upload = jest.fn();

        wrapper.vm.onUploadStart();

        expect(wrapper.vm.$refs.base.upload).toBeCalled();
      });
    });
  });
});
