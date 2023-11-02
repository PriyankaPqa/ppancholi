import {
  memberTestDev6, memberTestDev5, memberTestDev4, memberTestDev3, memberTestDev2, memberTestDev1, memberTestDev0,
  memberTestContributor3, memberTestContributorFinance, memberTestContributorIM, memberTestDevReadonly,
} from '../mocks/teams/team';

export const getUserName = (roleName: string) => {
  const map = {
    Level6: 'TestDev6',
    Level5: 'TestDev5',
    Level4: 'TestDev4',
    Level3: 'TestDev3',
    Level2: 'testdev2',
    Level1: 'TestDev1',
    Level0: 'TestDev0',
  } as Record<string, string>;
  return map[roleName];
};

// This method is here to help transitioning towards new role picking in Cypress.
// Once transition done 1) Remove getUserName method 2) Rename getUserNameBis to getUserName
export const getUserNameBis = (roleName: string) => {
  const map = {
    level6: 'TestDev6',
    level5: 'TestDev5',
    level4: 'TestDev4',
    level3: 'TestDev3',
    level2: 'testdev2',
    level1: 'TestDev1',
    level0: 'TestDev0',
  } as Record<string, string>;
  return map[roleName];
};

export const getUserRoleDescription = (roleName: string) => {
  const map = {
    Level6: 'System Admin',
    Level5: 'Systems Team Member',
    Level4: 'Operations Manager',
    Level3: 'EM Supervisor',
    Level2: 'Case Worker',
    Level1: 'Call Centre Agent',
    Level0: 'Call Centre Agent(L0)',
  } as Record<string, string>;
  return map[roleName];
};

// This method is here to help transitioning towards new role picking in Cypress.
// Once transition done 1) Remove getUserRoleDescription method 2) Rename getUserRoleDescriptionBis to getUserRoleDescription
export const getUserRoleDescriptionBis = (roleName: string) => {
  const map = {
    level6: 'System Admin',
    level5: 'Systems Team Member',
    level4: 'Operations Manager',
    level3: 'EM Supervisor',
    level2: 'Case Worker',
    level1: 'Call Centre Agent',
    level0: 'Call Centre Agent(L0)',
  } as Record<string, string>;
  return map[roleName];
};

export const getUserId = (roleName: string) => {
  const map = {
    Level6: memberTestDev6,
    Level5: memberTestDev5,
    Level4: memberTestDev4,
    Level3: memberTestDev3,
    Level2: memberTestDev2,
    Level1: memberTestDev1,
    Level0: memberTestDev0,
    Contributor1: memberTestContributorIM,
    Contributor2: memberTestContributorFinance,
    Contributor3: memberTestContributor3,
    ReadOnly: memberTestDevReadonly,
  } as Record<string, string>;
  return map[roleName];
};

// This method is here to help transitioning towards new role picking in Cypress.
// Once transition done 1) Remove getUserId method 2) Rename getUserIdBis to getUserId
export const getUserIdBis = (roleName: string) => {
  const map = {
    level6: memberTestDev6,
    level5: memberTestDev5,
    level4: memberTestDev4,
    level3: memberTestDev3,
    level2: memberTestDev2,
    level1: memberTestDev1,
    level0: memberTestDev0,
    contributor1: memberTestContributorIM,
    contributor2: memberTestContributorFinance,
    contributor3: memberTestContributor3,
    readOnly: memberTestDevReadonly,
  } as Record<string, string>;
  return map[roleName];
};
