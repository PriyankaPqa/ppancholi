import { mockEventSummary } from '@libs/entities-lib/event/event.mock';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, MassActionType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';

import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import Component from './CaseFileStatusMassActionCreate.vue';

const localVue = createLocalVue();

// eslint-disable-next-line max-len,vue/max-len
const filtersString = '{"search":"Metadata/PrimaryBeneficiary/ContactInformation/Email: /.*tammy.*/","skip":0,"top":10,"orderBy":"","filter":{"Entity/EventId":"60983874-18bb-467d-b55a-94dc55818151"}}';

const { pinia, massActionStore } = useMockMassActionStore();

describe('CaseFileStatusMassActionCreate.vue', () => {
  let wrapper;

  const doMount = (shallow, otherOptions = {}) => {
    const option = {
      localVue,
      pinia,
      mocks: {
        $route: {
          query: {
            searchParams: filtersString,
            mode: MassActionMode.List,
          },
        },
      },
      ...otherOptions,
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, option);
    } else {
      wrapper = mount(Component, option);
    }
  };

  describe('Template', () => {
    beforeEach(() => {
      doMount(false, {
        stubs: {
          CaseFileStatusMassActionCreateDetails: true,
        },
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should be linked to the correct props upload-url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/case-file-status');
      });

      it('should be linked to the correct props mode', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('mode')).toBe(MassActionMode.List);
      });

      it('should be linked the correct props formData', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('formData')).toBe(wrapper.vm.formData);
      });

      it('should call onSuccess when upload is successful', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onSuccess = jest.fn();
        component.vm.$emit('upload:success');
        expect(wrapper.vm.onSuccess).toBeCalled();
      });

      it('should call onUploadStart when upload is starting', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onUploadStart = jest.fn();
        component.vm.$emit('upload:start');
        expect(wrapper.vm.onUploadStart).toBeCalled();
      });

      it('should call onPost when creating from a list', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onPost = jest.fn();
        component.vm.$emit('post');
        expect(wrapper.vm.onPost).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.caseFileStatus.home.name });
      });
    });

    describe('onSuccess', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.onSuccess({ id: '1' });
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.caseFileStatus.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onUploadStart', () => {
      it('should add the payment details to the form data', async () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.$refs.base.upload = jest.fn();

        const form = {
          event: mockEventSummary(),
          reason: { optionItemId: 'option-item-id', specifiedOther: 'other' },
          rationale: 'rationale',
          status: 1,
        };
        await wrapper.setData({ form });
        wrapper.vm.formData.set = jest.fn();
        await wrapper.vm.onUploadStart();

        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('eventId', wrapper.vm.form.event.id);
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('status', '1');
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('reason', JSON.stringify(wrapper.vm.form.reason));
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('rationale', wrapper.vm.form.rationale);
      });

      it('should call upload method of the child', () => {
        const form = {
          event: mockEventSummary(),
          reason: { mockOptionItemId: 'option-item-id', specifiedOther: 'other' },
          rationale: 'rationale',
          status: 1,
        };
        wrapper.vm.form = form;

        wrapper.vm.$refs.base.upload = jest.fn();

        wrapper.vm.onUploadStart();

        expect(wrapper.vm.$refs.base.upload).toBeCalled();
      });
    });

    describe('onPost', () => {
      it('should call create action with proper parameters', async () => {
        doMount(true);
        wrapper.vm.formData.append = jest.fn();
        massActionStore.create = jest.fn();

        const name = 'Mass action';
        const description = 'description';
        await wrapper.setData({
          form: {
            event: mockEventSummary(),
            reason: { optionItemId: 'option-item-id', specifiedOther: 'other' },
            rationale: 'rationale',
            status: 1,
          },
        });

        const payload = {
          name,
          description,
          eventId: wrapper.vm.form.event.id,
          status: wrapper.vm.form.status,
          reason: wrapper.vm.form.reason,
          rationale: wrapper.vm.form.rationale,
          search: null,
          filter: "?$filter=Entity/EventId eq '60983874-18bb-467d-b55a-94dc55818151' and Entity/Status eq 'Active'",
        };
        await wrapper.vm.onPost({ name, description });

        expect(massActionStore.create).toHaveBeenCalledWith(MassActionType.CaseFileStatus, payload);
      });

      it('should call onSuccess method with proper parameters', async () => {
        const description = 'description';
        const name = 'name';
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              form: {
                event: mockEventSummary(),
                reason: { mockOptionItemId: 'option-item-id', specifiedOther: 'other' },
                rationale: 'rationale',
                status: 1,
              },
            };
          },
          mocks: {
            $route: {
              query: {
                searchParams: filtersString,
                mode: MassActionMode.List,
              },
            },
          },
        });
        wrapper.vm.onSuccess = jest.fn();
        massActionStore.create = jest.fn(() => mockMassActionEntity());
        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.onSuccess).toHaveBeenLastCalledWith(mockMassActionEntity());
      });

      it('should call  helper convertDateStringToDateObject with proper parameters', async () => {
        const description = 'description';
        const name = 'name';
        sharedHelpers.convertDateStringToDateObject = jest.fn();
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              form: {
                event: mockEventSummary(),
                reason: { mockOptionItemId: 'option-item-id', specifiedOther: 'other' },
                rationale: 'rationale',
                status: 1,
              },
            };
          },
          mocks: {
            $route: {
              query: {
                searchParams: filtersString,
                mode: MassActionMode.List,
              },
            },
          },
        });
        await wrapper.vm.onPost({ name, description });

        expect(sharedHelpers.convertDateStringToDateObject).toHaveBeenLastCalledWith(JSON.parse(wrapper.vm.$route.query.searchParams));
      });
    });
  });
});
