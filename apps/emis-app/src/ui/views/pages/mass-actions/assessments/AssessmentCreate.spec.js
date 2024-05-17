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
import { mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import utils from '@libs/entities-lib/utils';
import Component from './AssessmentCreate.vue';

const localVue = createLocalVue();

// eslint-disable-next-line max-len,vue/max-len
const filtersString = '{"search":"Metadata/PrimaryBeneficiary/ContactInformation/Email: /.*tammy.*/","skip":0,"top":10,"orderBy":"","filter":{"Entity/EventId":"60983874-18bb-467d-b55a-94dc55818151"}}';

const { pinia, massActionStore } = useMockMassActionStore();

describe('AssessmentCreate.vue', () => {
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
          AssessmentDetailsCreate: true,
        },
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should be linked to the correct props upload-url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/assessment');
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
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.assessments.home.name });
      });
    });

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.assessments.details.name, params: { id: '1' } },
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
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailSubject', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-subject-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.details.emailSubject).toEqual({ translation: { en: 'mock-subject-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailAdditionalDescription', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.details.emailAdditionalDescription).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailTopCustomContent', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.details.emailTopCustomContent).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
    });

    describe('onUpdate', () => {
      it('should update the details', () => {
        const formCopy = {
          event: mockEventSummary(),
          assessment: mockAssessmentFormEntity(),
          emailSubject: { translation: { en: 'en', fr: 'fr' } },
          emailAdditionalDescription: { translation: { en: 'en', fr: 'fr' } },
          emailTopCustomContent: { translation: { en: 'en top', fr: 'fr top' } },
        };

        wrapper.vm.onUpdate(formCopy);

        expect(wrapper.vm.details).toEqual(formCopy);
      });
    });

    describe('onUploadStart', () => {
      it('should add the payment details to the details data', () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.$refs.base.upload = jest.fn();

        const formCopy = {
          event: mockEventSummary(),
          assessment: mockAssessmentFormEntity(),
          emailSubject: { translation: { en: 'en', fr: 'fr' } },
          emailAdditionalDescription: { translation: { en: 'en', fr: 'fr' } },
          emailTopCustomContent: { translation: { en: 'en top', fr: 'fr top' } },
        };

        wrapper.vm.onUpdate(formCopy);

        wrapper.vm.onUploadStart();

        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('eventId', wrapper.vm.details.event.id);
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('assessmentFormId', wrapper.vm.details.assessment.id);
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('emailSubject', JSON.stringify(wrapper.vm.details.emailSubject.translation));
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('emailAdditionalDescription', JSON.stringify(wrapper.vm.details.emailAdditionalDescription.translation));
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('emailTopCustomContent', JSON.stringify(wrapper.vm.details.emailTopCustomContent.translation));
      });

      it('should call upload method of the child', () => {
        const formCopy = {
          event: mockEventSummary(),
          assessment: mockAssessmentFormEntity(),
          emailSubject: { translation: { en: 'en', fr: 'fr' } },
          emailAdditionalDescription: { translation: { en: 'en', fr: 'fr' } },
          emailTopCustomContent: { translation: { en: 'en top', fr: 'fr top' } },
        };

        wrapper.vm.onUpdate(formCopy);

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
        const description = '';

        const azureSearchParams = JSON.parse(filtersString);

        await wrapper.setData({
          details: {
            event: mockEventSummary(),
            assessment: mockAssessmentFormEntity(),
            emailSubject: { translation: { en: 'en', fr: 'fr' } },
            emailAdditionalDescription: { translation: { en: 'en', fr: 'fr' } },
            emailTopCustomContent: { translation: { en: 'en top', fr: 'fr top' } },
          },
        });

        const payload = {
          name,
          description,
          eventId: wrapper.vm.details.event.id,
          assessmentFormId: wrapper.vm.details.assessment.id,
          emailSubject: wrapper.vm.details.emailSubject,
          emailAdditionalDescription: wrapper.vm.details.emailAdditionalDescription,
          emailTopCustomContent: wrapper.vm.details.emailTopCustomContent,
          search: azureSearchParams.search,
          filter: "Entity/EventId eq '60983874-18bb-467d-b55a-94dc55818151' and Entity/Status eq 1",
        };
        await wrapper.vm.onPost({ name, description });

        expect(massActionStore.create).toHaveBeenCalledWith(MassActionType.Assessment, payload);
      });

      it('should call onSuccess method with proper parameters', async () => {
        const name = 'Mass action';
        const description = '';
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              details: {
                event: mockEventSummary(),
                assessment: mockAssessmentFormEntity(),
                emailSubject: { translation: { en: 'en', fr: 'fr' } },
                emailAdditionalDescription: { translation: { en: 'en', fr: 'fr' } },
                emailTopCustomContent: { translation: { en: 'en top', fr: 'fr top' } },
              },
            };
          },
          mocks: {

            $route: {
              query: {
                azureSearchParams: filtersString,
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
    });
  });
});
