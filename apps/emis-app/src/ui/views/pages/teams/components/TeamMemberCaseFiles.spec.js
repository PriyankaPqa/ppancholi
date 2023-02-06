import { createLocalVue, shallowMount } from '@/test/testSetup';
import flushPromises from 'flush-promises';
import { mockStorage } from '@/storage';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { mockCaseFileEntity, mockCombinedCaseFile, CaseFileStatus } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import Component from './TeamMemberCaseFiles.vue';

const localVue = createLocalVue();
const usersTestData = mockCombinedUserAccount({
  id: '8f05945f-0093-447f-80b2-cee1b0826678',
  teams: [
    {
      teamId: '6564e2d4-4f0d-45ad-b548-2ab3089a9256',
      name: 'qc earth',
      events: [
        { id: '3bacda14-503d-49ab-b102-0c14763823cb', name: { translation: { en: 'QC Earthquake 2022', fr: 'QC Earthquake 2022' } } },
        { id: 'e40493e1-6518-4f6f-9171-bf41f2646438', name: { translation: { en: 'SK Floods 2022', fr: 'SK Floods 2022' } } },
      ],
    },
    {
      teamId: '6946999c-f48c-4ef3-a519-c10a19f3cde6',
      name: 'standard team 2',
      events: [
        { id: '3bacda14-503d-49ab-b102-0c14763823cb', name: { translation: { en: 'QC Earthquake 2022', fr: 'QC Earthquake 2022' } } },
        { id: 'e40493e1-6518-4f6f-9171-bf41f2646438', name: { translation: { en: 'SK Floods 2022', fr: 'SK Floods 2022' } } },
      ],
    },
  ],

});
const storage = mockStorage();
const mockCaseFile = mockCombinedCaseFile();

const MOCK_CASEFILES = {
  '7d522743-90e8-4e01-91fc-edf88fd30c47': [
    {
      event: { id: '7d522743-90e8-4e01-91fc-edf88fd30c47', name: { translation: { en: 'Tammy test', fr: 'Tammy test' } } },
      teamName: 'Tammy team 2',
      caseFile: mockCaseFileEntity({ id: '808b2762-7fd3-42e1-b354-ba9e1cf5d1bb', eventId: '7d522743-90e8-4e01-91fc-edf88fd30c47' }),
      canAssign: true,
      canAccessFile: true,
    },
  ],
};

describe('TeamMemberCaseFiles.vue', () => {
  let wrapper;

  const doMount = async (otherOptions = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        member: usersTestData,
        show: true,
      },
      mocks: {
        $storage: storage,
      },
      ...otherOptions,
    });

    wrapper.vm.combinedCaseFileStore.search = jest.fn(() => ({ ids: [mockCaseFile.entity.id] }));
    await flushPromises();
  };

  describe('Methods', () => {
    beforeEach(() => {
      doMount({
        computed: {
          caseFileGroups() {
            return MOCK_CASEFILES;
          },
        },
      });
    });

    describe('fetchAllCaseFiles', () => {
      it('calls the service getAssignedCaseFiles and saves the data', async () => {
        const caseFiles = [mockCaseFile,
          { ...mockCaseFile, entity: { id: 'mock-1', caseFileStatus: CaseFileStatus.Closed } },
          { ...mockCaseFile, entity: { id: 'mock-2', caseFileStatus: CaseFileStatus.Archived } },
        ];
        wrapper.vm.$services.caseFiles.getAssignedCaseFiles = jest.fn(() => ({ value: caseFiles }));
        await wrapper.vm.fetchAllCaseFiles();
        expect(wrapper.vm.$services.caseFiles.getAssignedCaseFiles).toBeCalledTimes(1);
        expect(wrapper.vm.fetchedCaseFiles).toEqual([mockCaseFile]);
      });
    });

    describe('fetchCaseFilesWithAllowedAccess', () => {
      it('calls the storage action search with the right filter and saves the data', async () => {
        // eslint-disable-next-line max-len
        const filter = `Entity/AssignedTeamMembers/any(AssignedTeamMember:AssignedTeamMember/TeamMembersIds/any(teamMemberId:teamMemberId eq '${wrapper.vm.member.entity.id}'))`;
        await wrapper.vm.fetchCaseFilesWithAllowedAccess();
        expect(wrapper.vm.combinedCaseFileStore.search).toHaveBeenCalledWith({ filter });
        expect(wrapper.vm.caseFilesIdsWithAllowedAccess).toEqual([mockCaseFile.entity.id]);
      });
    });

    describe('openCaseFileAssignDialog', () => {
      it('sets selectedCaseFile to the method argument', async () => {
        const cf = mockCaseFileEntity();
        wrapper.vm.openCaseFileAssignDialog(cf);
        expect(wrapper.vm.selectedCaseFile).toEqual(cf);
      });

      it('sets showAssignmentsDialog to true', async () => {
        await wrapper.setData({ showAssignmentsDialog: false });
        await wrapper.vm.openCaseFileAssignDialog(mockCaseFileEntity());
        expect(wrapper.vm.showAssignmentsDialog).toEqual(true);
      });
    });

    describe('getCaseFileRoute', () => {
      it('returns the right route data', () => {
        const id = '012345';
        expect(wrapper.vm.getCaseFileRoute(id)).toEqual({
          name: routes.caseFile.activity.name,
          params: { id },
        });
      });
    });
  });

  describe('Life Cycle', () => {
    describe('created', () => {
      beforeEach(() => {
        doMount({
          computed: {
            caseFileGroups() {
              return MOCK_CASEFILES;
            },
          },
        });
      });

      it('calls fetchAllCaseFiles and fetchCaseFilesWithAllowedAccess', async () => {
        jest.spyOn(wrapper.vm, 'fetchAllCaseFiles').mockImplementation(() => {});
        jest.spyOn(wrapper.vm, 'fetchCaseFilesWithAllowedAccess').mockImplementation(() => {});
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.fetchAllCaseFiles).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.fetchCaseFilesWithAllowedAccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      doMount();
    });

    describe('caseFileGroups', () => {
      it('maps the fetchedCaseFiles correctly', async () => {
        const mockCaseFiles = [mockCombinedCaseFile({
          id: '3d835ec4-8f94-48c4-865e-46fc55b0cb3c',
          eventId: '3bacda14-503d-49ab-b102-0c14763823cb',
          assignedTeamMembers: [
            {
              teamId: '6564e2d4-4f0d-45ad-b548-2ab3089a9256',
              teamMembersIds: ['8f05945f-0093-447f-80b2-cee1b0826678'],
            },
          ],
        }),
        mockCombinedCaseFile({
          id: 'f4af3ea9-534b-4e41-b498-ed8e092e04e6',
          eventId: '3bacda14-503d-49ab-b102-0c14763823cb',
          assignedTeamMembers: [
            {
              teamId: '6564e2d4-4f0d-45ad-b548-2ab3089a9256',
              teamMembersIds: ['8f05945f-0093-447f-80b2-cee1b0826678'],
            },
          ],
        }),
        mockCombinedCaseFile({
          id: 'b15d3362-e878-4824-b669-4e6dfeb4175d',
          eventId: 'e40493e1-6518-4f6f-9171-bf41f2646438',
          assignedTeamMembers: [
            {
              teamId: '6946999c-f48c-4ef3-a519-c10a19f3cde6',
              teamMembersIds: ['8f05945f-0093-447f-80b2-cee1b0826678'],
            },
          ],
        })];

        await wrapper.setData({
          fetchedCaseFiles: mockCaseFiles,
          caseFilesIdsWithAllowedAccess: ['3d835ec4-8f94-48c4-865e-46fc55b0cb3c'],
        });

        expect(wrapper.vm.caseFileGroups).toEqual({
          '3bacda14-503d-49ab-b102-0c14763823cb': [
            {
              event: {
                id: '3bacda14-503d-49ab-b102-0c14763823cb',
                name: {
                  translation: {
                    en: 'QC Earthquake 2022',
                    fr: 'QC Earthquake 2022',
                  },
                },
              },
              teamName: 'qc earth',
              caseFile: mockCaseFiles[0].entity,
              canAssign: true,
              canAccessFile: true,
            },
            {
              event: {
                id: '3bacda14-503d-49ab-b102-0c14763823cb',
                name: {
                  translation: {
                    en: 'QC Earthquake 2022',
                    fr: 'QC Earthquake 2022',
                  },
                },
              },
              teamName: 'qc earth',
              caseFile: mockCaseFiles[1].entity,
              canAssign: false,
              canAccessFile: false,
            },
          ],
          'e40493e1-6518-4f6f-9171-bf41f2646438': [
            {
              event: {
                id: 'e40493e1-6518-4f6f-9171-bf41f2646438',
                name: {
                  translation: {
                    en: 'SK Floods 2022',
                    fr: 'SK Floods 2022',
                  },
                },
              },
              teamName: 'standard team 2',
              caseFile: mockCaseFiles[2].entity,
              canAssign: false,
              canAccessFile: false,
            },
          ],
        });
      });

      it('maps case file with canAccessFile set to false if the case file is inactive and the user is less than level 6', async () => {
        const mockCaseFiles = [mockCombinedCaseFile({
          id: '3d835ec4-8f94-48c4-865e-46fc55b0cb3c',
          eventId: '3bacda14-503d-49ab-b102-0c14763823cb',
          assignedTeamMembers: [
            {
              teamId: '6564e2d4-4f0d-45ad-b548-2ab3089a9256',
              teamMembersIds: ['8f05945f-0093-447f-80b2-cee1b0826678'],
            },
          ],
          caseFileStatus: CaseFileStatus.Inactive,
        })];

        wrapper.vm.$hasLevel = jest.fn(() => false);

        await wrapper.setData({
          fetchedCaseFiles: mockCaseFiles,
          caseFilesIdsWithAllowedAccess: ['3d835ec4-8f94-48c4-865e-46fc55b0cb3c'],
        });

        expect(wrapper.vm.caseFileGroups).toEqual({
          '3bacda14-503d-49ab-b102-0c14763823cb': [
            {
              event: {
                id: '3bacda14-503d-49ab-b102-0c14763823cb',
                name: {
                  translation: {
                    en: 'QC Earthquake 2022',
                    fr: 'QC Earthquake 2022',
                  },
                },
              },
              teamName: 'qc earth',
              caseFile: mockCaseFiles[0].entity,
              canAssign: false,
              canAccessFile: true,
            },
          ],
        });
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      doMount({
        computed: {
          caseFileGroups() {
            return MOCK_CASEFILES;
          },
        },
      });
    });

    describe('event name', () => {
      it('is displayed', () => {
        const element = wrapper.findDataTest('team_member_caseFile_event_name');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain(Object.values(MOCK_CASEFILES)[0][0].event.name.translation.en);
      });
    });

    describe('case file number', () => {
      it('is displayed', () => {
        const element = wrapper.findDataTest('team_member_caseFile_number_0');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain(Object.values(MOCK_CASEFILES)[0][0].caseFile.caseFileNumber);
      });

      it('leads to the right page when clicked', () => {
        const route = {
          name: routes.caseFile.activity.name,
          params: { id: Object.values(wrapper.vm.caseFileGroups)[0][0].caseFile.id },
        };
        wrapper.vm.getCaseFileRoute = jest.fn(() => route);
        const element = wrapper.findDataTest('team_member_caseFile_number_0');

        expect(element.props('to')).toEqual(route);
      });

      it('has the class isDisabled if canAccessFile is false', async () => {
        const caseFiles = { '7d522743-90e8-4e01-91fc-edf88fd30c47': [{ ...MOCK_CASEFILES['7d522743-90e8-4e01-91fc-edf88fd30c47'][0], canAccessFile: false }] };
        await doMount({
          computed: {
            caseFileGroups() {
              return caseFiles;
            },
          },
        });
        const element = wrapper.findDataTest('team_member_caseFile_number_0');
        expect(element.classes('isDisabled')).toBe(true);
      });

      it('does not the class isDisabled if canAccessFile is true', () => {
        const element = wrapper.findDataTest('team_member_caseFile_number_0');
        expect(element.classes('isDisabled')).toBe(false);
      });
    });

    describe('team name', () => {
      it('is displayed', () => {
        const element = wrapper.findDataTest('team_member_caseFile_teamName_0');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain(Object.values(MOCK_CASEFILES)[0][0].teamName);
      });
    });

    describe('case file status', () => {
      it('is displayed', () => {
        const element = wrapper.findDataTest('team_member_caseFile_status_0');
        expect(element.exists()).toBeTruthy();
        expect(element.props('status')).toEqual(Object.values(MOCK_CASEFILES)[0][0].caseFile.caseFileStatus);
      });
    });

    describe('case file reassign button', () => {
      it('is displayed', () => {
        const element = wrapper.findDataTest('team_member_caseFile_reassign_btn_0');
        expect(element.exists()).toBeTruthy();
      });
      it('triggers the right method', async () => {
        wrapper.vm.openCaseFileAssignDialog = jest.fn();
        const element = wrapper.findDataTest('team_member_caseFile_reassign_btn_0');
        await element.vm.$emit('click');
        expect(wrapper.vm.openCaseFileAssignDialog).toHaveBeenCalledWith(Object.values(MOCK_CASEFILES)[0][0].caseFile);
      });

      it('is disabled if canAssign is false', async () => {
        const caseFiles = { '7d522743-90e8-4e01-91fc-edf88fd30c47': [{ ...MOCK_CASEFILES['7d522743-90e8-4e01-91fc-edf88fd30c47'][0], canAssign: false }] };
        await doMount({
          computed: {
            caseFileGroups() {
              return caseFiles;
            },
          },
        });
        const element = wrapper.findDataTest('team_member_caseFile_reassign_btn_0');
        expect(element.props('disabled')).toEqual(true);
      });

      it('is not disabled if canAssign is true', () => {
        const element = wrapper.findDataTest('team_member_caseFile_reassign_btn_0');
        expect(element.props('disabled')).toEqual(false);
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      doMount();
    });
    it('should call fetchAllCaseFiles if showAssignmentsDialog is being closed', async () => {
      await wrapper.setData({ showAssignmentsDialog: true, selectedCaseFile: mockCaseFileEntity() });
      wrapper.vm.fetchAllCaseFiles = jest.fn();
      await wrapper.setData({ showAssignmentsDialog: false });
      expect(wrapper.vm.fetchAllCaseFiles).toHaveBeenCalledTimes(1);
    });
  });
});
