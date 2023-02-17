import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { SurveyJsTextExtractor } from '@libs/shared-lib/plugins/surveyJs/SurveyJsTextExtractor';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template.mock';
import { createTestingPinia } from '@pinia/testing';
import flushPromises from 'flush-promises';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from './AssessmentBuilder.vue';

let services = mockProvider();
const localVue = createLocalVue();
let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
let tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;

describe('AssessmentBuilder', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, eventId = 'mock-event-id') => {
    jest.clearAllMocks();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        testMode: true,
        id: eventId,
      },
      mocks: {
        $services: services,
        $route: {
          params: {
            assessmentTemplateId: 'mock-assessmentTemplate-id',
          },
        },
      },
    });
    wrapper.vm.$services.tenantSettings.getLogoUrl = jest.fn((l) => `url ${l}`);
    await flushPromises();
  };

  beforeEach(async () => {
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
    tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;
    services = mockProvider();
    services.assessmentForms.assessmentTotalSubmissions = jest.fn(() => ({ totalAssigned: 0 }));
    await mountWrapper();
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls loadDetails', async () => {
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.loadDetails).toHaveBeenCalled();
      });
      it('sets creator with default value when no existing data', async () => {
        assessmentFormStore.fetch = jest.fn(() => null);
        await mountWrapper();
        expect(wrapper.vm.creator).not.toBeNull();
        expect(JSON.stringify(JSON.parse(wrapper.vm.creator.text))).toBe(JSON.stringify(JSON.parse(wrapper.vm.getDefaultJson())));
      });
      it('sets creator with rawjson value when existing data', () => {
        expect(wrapper.vm.creator).not.toBeNull();
        expect(JSON.stringify(JSON.parse(wrapper.vm.creator.text))).toBe(JSON.stringify(JSON.parse(wrapper.vm.assessmentTemplate.externalToolState?.data?.rawJson)));
      });
      it('sets save and export function and lastRawJsonSaved', () => {
        expect(wrapper.vm.creator.saveSurveyFunc).toBe(wrapper.vm.saveSurveyJson);
        expect(wrapper.vm.creator.onExtractSurvey.length).toBe(1);
        expect(wrapper.vm.lastRawJsonSaved).toEqual(wrapper.vm.creator.text);
      });
      it('sets color scheme', async () => {
        jest.clearAllMocks();
        wrapper.vm.surveyJsHelper.setColorScheme = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.surveyJsHelper.setColorScheme).toHaveBeenCalledWith(
          '#surveyCreator',
          tenantSettingsStore.currentTenantSettings.branding.colours,
        );
      });

      it('sets creator readonly if totalAssigned > 0 and confirmed', async () => {
        jest.clearAllMocks();
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.$services.assessmentForms.assessmentTotalSubmissions = jest.fn(() => ({ totalAssigned: 0 }));

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
        expect(wrapper.vm.creator.readOnly).toBeFalsy();

        jest.clearAllMocks();
        wrapper.vm.$services.assessmentForms.assessmentTotalSubmissions = jest.fn(() => ({ totalAssigned: 1 }));
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$confirm).toHaveBeenCalled();
        expect(wrapper.vm.creator.readOnly).toBeTruthy();

        jest.clearAllMocks();
        wrapper.vm.$confirm = jest.fn(() => false);
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$confirm).toHaveBeenCalled();
        expect(wrapper.vm.creator.readOnly).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('metaTitle', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaTitle).toBe('metaInfo.assessment_builder.title');
      });
    });
  });

  describe('methods', () => {
    describe('saveSurveyJson', () => {
      it('sets rawJson and questions properties', async () => {
        wrapper.vm.creator.text = JSON.stringify({
          logo: {
            default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
            fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
          },
          logoPosition: 'right',
          pages: [
            {
              name: 'page1',
              elements: [
                {
                  type: 'text',
                  name: 'question1',
                  title: {
                    default: 'Text eng',
                    fr: 'Text fr',
                  },
                  score: 1,
                },
              ],
            },
          ],
        });
        expect(wrapper.vm.assessmentTemplate.externalToolState?.data?.rawJson).not.toEqual(wrapper.vm.creator.text);
        expect(wrapper.vm.assessmentTemplate.questions).not.toEqual(wrapper.vm.surveyJsHelper.getAssessmentQuestions());
        await wrapper.vm.saveSurveyJson(null, () => {});
        expect(wrapper.vm.assessmentTemplate.externalToolState?.data?.rawJson).toEqual(wrapper.vm.creator.text);
        expect(wrapper.vm.assessmentTemplate.questions).toEqual(wrapper.vm.surveyJsHelper.getAssessmentQuestions());
      });

      it('calls save method for correct storage and sets lastRawJsonSaved', async () => {
        wrapper.vm.lastRawJsonSaved = 'nope';
        await wrapper.vm.saveSurveyJson(null, () => {});
        expect(assessmentFormStore.updateAssessmentStructure).toHaveBeenCalledWith(wrapper.vm.assessmentForm);
        await wrapper.setProps({ id: null });
        jest.clearAllMocks();
        await wrapper.vm.saveSurveyJson(null, () => {});
        expect(assessmentTemplateStore.updateAssessmentStructure).toHaveBeenCalledWith(wrapper.vm.assessmentTemplate);
        expect(wrapper.vm.lastRawJsonSaved).toEqual(wrapper.vm.creator.text);
      });
    });

    describe('getDefaultJson', () => {
      it('returns the urls for logos', () => {
        const result = wrapper.vm.getDefaultJson();
        expect(JSON.stringify(JSON.parse(result))).toEqual(JSON.stringify(JSON.parse(`{
          "logo": {
            "default": "url en",
            "fr": "url fr"
          },
          "logoPosition": "right",
          "clearInvisibleValues": "onHiddenContainer"
          }`)));
      });
    });

    describe('extract', () => {
      it('calls the endpoint with the html', async () => {
        const extractFct = jest.fn(() => ({
          type: 'survey',
          identifier: 'survey',
          title: 'title',
          description: 'description',
          elements: [],
        }));
        SurveyJsTextExtractor.prototype.extractAllText = extractFct;
        const backup = document.getElementById;
        document.getElementById = jest.fn(() => ({ innerHTML: 'htmlcontent' }));
        await wrapper.vm.extract();
        expect(wrapper.vm.$services.assessmentForms.htmlToWord).toHaveBeenCalledWith('<html>htmlcontent</html>', 'title.docx');
        expect(extractFct).toHaveBeenCalledWith(wrapper.vm.creator.survey.toJSON());
        expect(wrapper.vm.extractedData).toEqual(extractFct());
        document.getElementById = backup;
      });
    });

    describe('beforeWindowUnload', () => {
      it('calls preventDefault and sets returnValue when survey is not saved', async () => {
        const event = {
          preventDefault: jest.fn(),
          returnValue: null,
        };
        wrapper.vm.lastRawJsonSaved = 'nope';
        wrapper.vm.beforeWindowUnload(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.returnValue).toEqual('');
      });
    });
  });
});
