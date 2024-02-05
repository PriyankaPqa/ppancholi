import { mockEvent } from '@libs/entities-lib/registration-event/registrationEvent.mock';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, mockMassActionEntity, MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';
import utils from '@libs/entities-lib/utils';
import Component from './CommunicationCreate.vue';

const localVue = createLocalVue();

// eslint-disable-next-line max-len,vue/max-len
const filtersString = '{"search":"Metadata/PrimaryBeneficiary/ContactInformation/Email: /.*tammy.*/","skip":0,"top":10,"orderBy":"","filter":{"and":{"Entity/EventId":"60983874-18bb-467d-b55a-94dc55818151"}}}';

const { pinia, massActionStore } = useMockMassActionStore();

describe('CommunicationCreate.vue', () => {
  let wrapper;

  const doMount = (shallow, otherOptions = {}) => {
    const option = {
      localVue,
      pinia,
      mocks: {

        $route: {
          query: {
            azureSearchParams: filtersString,
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
          CommunicationDetailsCreate: true,
        },
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should be linked to the correct props upload-url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/communication');
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
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.communications.home.name });
      });
    });

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.communications.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onSuccess', () => {
      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalledWith(mockMassActionEntity().id);
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to messageSubject', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-subject-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.details.messageSubject).toEqual({ translation: { en: 'mock-subject-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailMessage', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.details.emailMessage).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
    });

    describe('onUpdate', () => {
      it('should update the details', () => {
        const formCopy = {
          event: mockEvent(),
          method: MassActionCommunicationMethod.Email,
          messageSubject: { translation: { en: 'en', fr: 'fr' } },
          emailMessage: { translation: { en: 'en', fr: 'fr' } },
          smsMessage: { translation: { en: 'en', fr: 'fr' } },
        };

        wrapper.vm.onUpdate(formCopy);

        expect(wrapper.vm.details).toEqual(formCopy);
      });
    });

    describe('onAddfile', () => {
      it('should update files', () => {
        const file = [new File(['foo'], 'mockname.png')];
        wrapper.vm.onAddfile(file);
        expect(wrapper.vm.files).toEqual(file);
      });
    });

    describe('onUploadStart', () => {
      it('should add the communication details to the details data', () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.$refs.base.upload = jest.fn();

        const formCopy = {
          event: mockEvent(),
          method: MassActionCommunicationMethod.Email,
          messageSubject: { translation: { en: 'en', fr: 'fr' } },
          emailMessage: { translation: { en: 'en', fr: 'fr' } },
          smsMessage: { translation: { en: 'en', fr: 'fr' } },
        };

        wrapper.vm.onUpdate(formCopy);

        wrapper.vm.onUploadStart();
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('eventId', wrapper.vm.details.event.id);
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('method', wrapper.vm.details.method.toString());
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('messageSubject', JSON.stringify(wrapper.vm.details.messageSubject.translation));
      });

      it('should call upload method of the child', () => {
        const formCopy = {
          event: mockEvent(),
          method: MassActionCommunicationMethod.Email,
          messageSubject: { translation: { en: 'en', fr: 'fr' } },
          emailMessage: { translation: { en: 'en', fr: 'fr' } },
          smsMessage: { translation: { en: 'en', fr: 'fr' } },
        };

        wrapper.vm.onUpdate(formCopy);

        wrapper.vm.$refs.base.upload = jest.fn();

        wrapper.vm.onUploadStart();

        expect(wrapper.vm.$refs.base.upload).toBeCalled();
      });
    });

    describe('onPost', () => {
      it('should add the communication details to the details data', async () => {
        const name = 'Mass action';
        const description = '';
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.$refs.base.uploadForm = jest.fn();

        const formCopy = {
          event: mockEvent(),
          method: MassActionCommunicationMethod.Email,
          messageSubject: { translation: { en: 'en', fr: 'fr' } },
          emailMessage: { translation: { en: 'en', fr: 'fr' } },
          smsMessage: { translation: { en: 'en', fr: 'fr' } },
        };

        wrapper.vm.onUpdate(formCopy);

        await wrapper.vm.onPost({ name, description });
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('eventId', wrapper.vm.details.event.id);
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('method', wrapper.vm.details.method.toString());
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('messageSubject', JSON.stringify(wrapper.vm.details.messageSubject.translation));
      });

      it('should call upload method of the child', async () => {
        const formCopy = {
          event: mockEvent(),
          method: MassActionCommunicationMethod.Email,
          messageSubject: { translation: { en: 'en', fr: 'fr' } },
          emailMessage: { translation: { en: 'en', fr: 'fr' } },
          smsMessage: { translation: { en: 'en', fr: 'fr' } },
        };

        wrapper.vm.onUpdate(formCopy);
        const name = 'Mass action';
        const description = '';
        wrapper.vm.$refs.base.uploadForm = jest.fn();

        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.$refs.base.uploadForm).toBeCalled();
      });

      it('should call upload form with proper parameters', async () => {
        doMount(true);
        wrapper.vm.formData.append = jest.fn();
        massActionStore.create = jest.fn();
        wrapper.vm.$refs.base.uploadForm = jest.fn();
        const name = 'Mass action';
        const description = '';

        await wrapper.setData({
          details: {
            event: mockEvent(),
            method: MassActionCommunicationMethod.Email,
            messageSubject: { translation: { en: 'en', fr: 'fr' } },
            emailMessage: { translation: { en: 'en', fr: 'fr' } },
            smsMessage: { translation: { en: 'en', fr: 'fr' } },
          },
        });
        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.$refs.base.uploadForm).toHaveBeenCalledWith(wrapper.vm.formData, 'case-file/mass-actions/communication-from-list');
      });

      it('should call onSuccess method with proper parameters', async () => {
        const name = 'Mass action';
        const description = '';
        doMount(true);
        wrapper.vm.$refs.base.uploadForm = jest.fn();
        await wrapper.setData({
          details: {
            event: mockEvent(),
            method: MassActionCommunicationMethod.Email,
            messageSubject: { translation: { en: 'en', fr: 'fr' } },
            emailMessage: { translation: { en: 'en', fr: 'fr' } },
            smsMessage: { translation: { en: 'en', fr: 'fr' } },
          },
        });
        wrapper.vm.onSuccess = jest.fn();
        wrapper.vm.$refs.base.uploadSuccess = jest.fn(() => true);

        wrapper.vm.$refs.base.response = { data: mockMassActionEntity() };
        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.onSuccess).toHaveBeenLastCalledWith(mockMassActionEntity());
      });
    });
  });
});
