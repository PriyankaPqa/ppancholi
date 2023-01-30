import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import {
 IdParams, mockTeamEntities, mockTeamMembersData, mockTeamsDataAddHoc, mockTeamsDataStandard,
} from '@libs/entities-lib/team';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { mockTeamsService } from '@libs/services-lib/teams/entity';
import { Entity } from '@/pinia/team/team';
import { getExtensionComponents } from '@/pinia/team/team-extension';

const entityService = mockTeamsService();
const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-team': {
        items: mockTeamEntities(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useTeamTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useTeamStore = defineStore('test-event', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useTeamStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useTeamTestStore(bComponents);
  return store;
};

describe('Team Store', () => {
  describe('actions', () => {
    describe('getTeamsAssignable', () => {
      it('should call getTeamsAssignable service with proper params', async () => {
        const store = createTestStore();
        entityService.getTeamsAssignable = jest.fn();
        await store.getTeamsAssignable('abc');

        expect(entityService.getTeamsAssignable).toBeCalledWith('abc');
      });
    });

    describe('getTeamsAssigned', () => {
      it('calls the service getTeamsAssigned with the right params', async () => {
        const store = createTestStore();
        entityService.getTeamsAssigned = jest.fn();
        const caseFileId = '1234';
        await store.getTeamsAssigned(caseFileId);
        expect(entityService.getTeamsAssigned).toHaveBeenCalledWith(caseFileId);
      });
    });

    describe('createTeam', () => {
      it('should call createTeam service with proper params and commit results', async () => {
        const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
        const store = createTestStore(bComponents);
        const res = mockTeamsDataAddHoc();
        entityService.createTeam = jest.fn(() => res);
        await store.createTeam(mockTeamsDataStandard());

        expect(entityService.createTeam).toBeCalledWith(mockTeamsDataStandard());
        expect(bComponents.set).toBeCalledWith(res);
        expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      });
    });

    describe('editTeam', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        entityService.editTeam = jest.fn(() => mockTeamsDataAddHoc());
        await store.editTeam(mockTeamsDataStandard());

        expect(entityService.editTeam).toBeCalledWith(mockTeamsDataStandard());
        expect(bComponents.set).toBeCalledWith(mockTeamsDataAddHoc());
      });
    });

    describe('addTeamMembers', () => {
      it('should call addTeamMembers service with proper params and commit results', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        entityService.addTeamMembers = jest.fn(() => mockTeamsDataAddHoc());
        await store.addTeamMembers({ teamId: 'abc', teamMembers: mockTeamMembersData() });

        expect(entityService.addTeamMembers).toBeCalledWith('abc', mockTeamMembersData());
        expect(bComponents.set).toBeCalledWith(mockTeamsDataAddHoc());
      });
    });

    describe('removeTeamMember', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        entityService.removeTeamMember = jest.fn(() => mockTeamsDataAddHoc());
        await store.removeTeamMember({ teamId: 'abc', teamMemberId: 'sss' });

        expect(entityService.removeTeamMember).toBeCalledWith('abc', 'sss');
        expect(bComponents.set).toBeCalledWith(mockTeamsDataAddHoc());
      });
    });

    describe('emptyTeam', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        entityService.emptyTeam = jest.fn(() => mockTeamsDataAddHoc());
        await store.emptyTeam({ teamId: 'abc' });

        expect(entityService.emptyTeam).toBeCalledWith('abc');
        expect(bComponents.set).toBeCalledWith(mockTeamsDataAddHoc());
      });
    });
  });
});
