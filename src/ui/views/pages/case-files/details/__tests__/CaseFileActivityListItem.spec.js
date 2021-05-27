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
          item: mockCaseFileActivities(ECaseFileActivityType.AddedTag)[0],
        });
        expect(wrapper.vm.makeContentForTags).toHaveBeenCalledWith(ECaseFileActivityType.AddedTag);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is RemovedTag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTags').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.RemovedTag)[0],
        });
        expect(wrapper.vm.makeContentForTags).toHaveBeenCalledWith(ECaseFileActivityType.RemovedTag);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is AddedDuplicateFlag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForAddedDuplicateFlag').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.AddedDuplicateFlag)[0],
        });
        expect(wrapper.vm.makeContentForAddedDuplicateFlag).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is RemovedDuplicateFlag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForRemovedDuplicateFlag').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.RemovedDuplicateFlag)[0],
        });
        expect(wrapper.vm.makeContentForRemovedDuplicateFlag).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is TriageUpdated', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTriageUpdated').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.TriageUpdated)[0],
        });
        expect(wrapper.vm.makeContentForTriageUpdated).toHaveBeenCalledTimes(1);
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
          item: mockCaseFileActivities(ECaseFileActivityType.AddedTag)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is RemovedTag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.RemovedTag)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is AddedDuplicateFlag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.AddedDuplicateFlag)[0],

        });
        expect(wrapper.vm.icon).toEqual('$rctech-duplicate');
      });

      it('returns the correct icon when action type is RemovedDuplicateFlag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.RemovedDuplicateFlag)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-duplicate');
      });

      it('returns the correct icon when action type is TriageUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.TriageUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is CaseFileStatusDeactivated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusDeactivated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is CaseFileStatusClosed', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusClosed)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-lock');
      });

      it('returns the correct icon when action type is CaseFileStatusReopen', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusReopened)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-lock-open');
      });

      it('returns the correct icon when action type is CaseFileStatusArchived', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusArchived)[0],
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
            item: mockCaseFileActivities(ECaseFileActivityType.AddedTag)[0],

          });
          expect(wrapper.vm.makeContentForTags(ECaseFileActivityType.AddedTag)).toEqual({
            title: `caseFileActivity.activityList.title.${ECaseFileActivityType[ECaseFileActivityType.AddedTag]}`,
            body: 'caseFileActivity.activityList.tags.tag_names: tag 1, Tag 2',
          });
        });

        it('returns the correct data when action type is RemovedTag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.RemovedTag)[0],
          });

          expect(wrapper.vm.makeContentForTags(ECaseFileActivityType.RemovedTag)).toEqual({
            title: `caseFileActivity.activityList.title.${ECaseFileActivityType[ECaseFileActivityType.RemovedTag]}`,
            body: 'caseFileActivity.activityList.tags.tag_names: tag 4',
          });
        });
      });

      describe('makeContentForAddedDuplicateFlag', () => {
        it('returns the correct data when action type is AddedDuplicateFlag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.AddedDuplicateFlag)[0],
          });

          expect(wrapper.vm.makeContentForAddedDuplicateFlag()).toEqual({
            title: 'caseFileActivity.activityList.title.addedDuplicateFlag',
            body: 'DuplicateStatus.Added',
          });
        });
      });

      describe('makeContentForRemovedDuplicateFlag', () => {
        it('returns the correct data when action type is RemovedDuplicateFlag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.RemovedDuplicateFlag)[0],
          });

          expect(wrapper.vm.makeContentForRemovedDuplicateFlag()).toEqual({
            title: 'caseFileActivity.activityList.title.removedDuplicateFlag',
            body: 'DuplicateStatus.Removed',
          });
        });
      });

      describe('makeContentForTriageUpdated', () => {
        it('returns the correct data when action type is TriageUpdated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.TriageUpdated)[0],
          });

          expect(wrapper.vm.makeContentForTriageUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.triageUpdated',
            body: 'caseFileActivity.activityList.triage.new_triage: Tier 1',
          });
        });
      });

      describe('makeContentForCaseFileStatusDeactivated', () => {
        it('returns the correct data when action type is CaseFileStatusDeactivated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusDeactivated)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusDeactivated()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusDeactivated',
            body: 'caseFileActivity.activityList.status.reason: Deceased\ncaseFileActivity.activityList.status.rationale: test',
          });
        });
      });

      describe('makeContentForCaseFileStatusClosed', () => {
        it('returns the correct data when action type is CaseFileStatusClosed', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusClosed)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusClosed()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusClosed',
            body: 'caseFileActivity.activityList.status.reason: End of CRC support\ncaseFileActivity.activityList.status.rationale: test',
          });
        });
      });

      describe('makeContentForCaseFileStatusArchived', () => {
        it('returns the correct data when action type is CaseFileStatusArchived', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusArchived)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusArchived()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusArchived',
            body: null,
          });
        });
      });

      describe('makeContentForCaseFileStatusReopened', () => {
        it('returns the correct data when action type is CaseFileStatusReopened', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(ECaseFileActivityType.CaseFileStatusReopened)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusReopened()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusReopened',
            body: 'caseFileActivity.activityList.status.rationale: test',
          });
        });
      });
    });
  });
});
