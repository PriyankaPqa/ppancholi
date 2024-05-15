import { mockTeamEntity } from '@libs/entities-lib/team';

export function getMockExtensionComponents() {
  const entity = mockTeamEntity();
  return {
    getTeamsAssignable: jest.fn(() => [entity]),
    getTeamsAssigned: jest.fn(() => [entity]),
    getTeamsByEvent: jest.fn(() => [entity]),
    createTeam: jest.fn(() => entity),
    editTeam: jest.fn(() => entity),
    addTeamMembers: jest.fn(() => entity),
    removeTeamMember: jest.fn(() => entity),
    emptyTeam: jest.fn(() => entity),
  };
}
