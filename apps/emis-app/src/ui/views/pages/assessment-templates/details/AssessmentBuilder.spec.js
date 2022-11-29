import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { SurveyJsTextExtractor } from '@libs/shared-lib/plugins/surveyJs/SurveyJsTextExtractor';
import flushPromises from 'flush-promises';
import Component from './AssessmentBuilder.vue';

let storage = mockStorage();
const localVue = createLocalVue();

describe('AssessmentBuilder', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, eventId = 'mock-event-id') => {
    jest.clearAllMocks();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        testMode: true,
        id: eventId,
      },
      mocks: {
        $storage: storage,
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
    storage = mockStorage();
    storage.tenantSettings.getters.logoUrl = jest.fn((lang) => `some url ${lang}`);
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
        storage.assessmentForm.actions.fetch = jest.fn(() => null);
        await mountWrapper();
        expect(wrapper.vm.creator).not.toBeNull();
        expect(JSON.stringify(JSON.parse(wrapper.vm.creator.text))).toBe(JSON.stringify(JSON.parse(wrapper.vm.getDefaultJson())));
      });
      it('sets creator with rawjson value when existing data', () => {
        expect(wrapper.vm.creator).not.toBeNull();
        expect(JSON.stringify(JSON.parse(wrapper.vm.creator.text))).toBe(JSON.stringify(JSON.parse(wrapper.vm.assessmentTemplate.externalToolState?.data?.rawJson)));
      });
      it('sets save and export function', () => {
        expect(wrapper.vm.creator.saveSurveyFunc).toBe(wrapper.vm.saveSurveyJson);
        expect(wrapper.vm.creator.onExtractSurvey.length).toBe(1);
      });
      it('sets color scheme', async () => {
        jest.clearAllMocks();
        wrapper.vm.surveyJsHelper.setColorScheme = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.surveyJsHelper.setColorScheme).toHaveBeenCalledWith(
          '#surveyCreator',
          storage.tenantSettings.getters.currentTenantSettings().branding.colours,
        );
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

      it('calls save method for correct storage', async () => {
        await wrapper.vm.saveSurveyJson(null, () => {});
        expect(storage.assessmentForm.actions.updateAssessmentStructure).toHaveBeenCalledWith(wrapper.vm.assessmentForm);
        await wrapper.setProps({ id: null });
        jest.clearAllMocks();
        await wrapper.vm.saveSurveyJson(null, () => {});
        expect(storage.assessmentTemplate.actions.updateAssessmentStructure).toHaveBeenCalledWith(wrapper.vm.assessmentTemplate);
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
  });
});
