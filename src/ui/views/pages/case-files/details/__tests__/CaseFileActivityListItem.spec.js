import { createLocalVue, shallowMount } from '@/test/testSetup';
import { ECaseFileActivityType, mockCaseFileActivities } from '@/entities/case-file';

import Component from '../case-file-activity/components/CaseFileActivityListItem.vue';

const localVue = createLocalVue();
const item = mockCaseFileActivities()[0];

describe('CaseFileActivityListItem.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          item,
        },
        computed: {
          content() {
            return {
              title: 'mock-title',
              body: 'mock-body',
            };
          },
        },
      });
    });

    describe('content', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if the content is null', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item,
          },
          computed: {
            content() {
              return null;
            },
          },
        });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('content title', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.exists()).toBeTruthy();
      });
      it('contains the content title', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.text()).toEqual(wrapper.vm.content.title);
      });
    });

    describe('content body', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body');
        expect(element.exists()).toBeTruthy();
      });
      it('contains the content body', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body');
        expect(element.text()).toEqual(wrapper.vm.content.body);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          item,
        },

      });
    });

    describe('content', () => {
      it('calls the right method when action type is AddedTag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTags').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: {

            activityType: ECaseFileActivityType.AddedTag,
          },
        });
        expect(wrapper.vm.makeContentForTags).toHaveBeenCalledWith(ECaseFileActivityType.AddedTag);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is RemovedTag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTags').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: {
            activityType: ECaseFileActivityType.RemovedTag,
          },
        });
        expect(wrapper.vm.makeContentForTags).toHaveBeenCalledWith(ECaseFileActivityType.RemovedTag);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the right object in default case', async () => {
        await wrapper.setProps({
          item: {
            activityType: 'foo',
          },
        });
        expect(wrapper.vm.content).toEqual(null);
      });
    });

    describe('icon', () => {
      it('returns the correct icon when action type is AddedTag', async () => {
        await wrapper.setProps({
          item: {
            userName: 'Jane Doe',
            roleName: { translation: { en: 'sys admin' } },
            actionDateTime: '2021-01-02',
            activityType: ECaseFileActivityType.AddedTag,
            details: { tags: [{ name: { translation: { en: 'tag 1' } } }, { name: { translation: { en: 'Tag 2' } } }] },
          },
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is RemovedTag', async () => {
        await wrapper.setProps({
          item: {
            userName: 'Jane Doe',
            roleName: { translation: { en: 'sys admin' } },
            actionDateTime: '2021-01-02',
            activityType: ECaseFileActivityType.RemovedTag,
            details: { tags: [{ name: { translation: { en: 'tag 1' } } }, { name: { translation: { en: 'Tag 2' } } }] },
          },
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon in default case', async () => {
        await wrapper.setProps({
          item: {
            item: {
              userName: 'Jane Doe',
              roleName: { translation: { en: 'sys admin' } },
              actionDateTime: '2021-01-02',
              activityType: 'foo',
              details: { tags: [{ name: { translation: { en: 'tag 1' } } }, { name: { translation: { en: 'Tag 2' } } }] },
            },
          },
        });

        expect(wrapper.vm.icon).toEqual('mdi-message-text');
      });
    });

    describe('Methods', () => {
      describe('makeContentForTags', () => {
        it('returns the correct data when action type is AddedTag', async () => {
          await wrapper.setProps({
            item: {
              userName: 'Jane Doe',
              roleName: { translation: { en: 'sys admin' } },
              actionDateTime: '2021-01-02',
              activityType: ECaseFileActivityType.AddedTag,
              details: { tags: [{ name: { translation: { en: 'tag 1' } } }, { name: { translation: { en: 'Tag 2' } } }] },
            },
          });
          expect(wrapper.vm.makeContentForTags(ECaseFileActivityType.AddedTag)).toEqual({
            title: `caseFileActivity.activityList.title.${ECaseFileActivityType[ECaseFileActivityType.AddedTag]}`,
            body: 'caseFileActivity.activityList.tags.tag_names: tag 1, Tag 2',
          });
        });

        it('returns the correct data when action type is RemovedTag', async () => {
          await wrapper.setProps({
            item: {
              userName: 'Jane Doe',
              roleName: { translation: { en: 'sys admin' } },
              actionDateTime: '2021-01-02',
              activityType: ECaseFileActivityType.RemovedTag,
              details: { tags: [{ name: { translation: { en: 'tag 1' } } }, { name: { translation: { en: 'Tag 2' } } }] },
            },
          });

          expect(wrapper.vm.makeContentForTags(ECaseFileActivityType.RemovedTag)).toEqual({
            title: `caseFileActivity.activityList.title.${ECaseFileActivityType[ECaseFileActivityType.RemovedTag]}`,
            body: 'caseFileActivity.activityList.tags.tag_names: tag 1, Tag 2',
          });
        });
      });
    });
  });
});
