import {
  memberTestDev6, memberTestDev5, memberTestDev4, memberTestDev3, memberTestDev2, memberTestDev1, memberTestDev0,
  memberTestContributor3, memberTestContributorFinance, memberTestContributorIM, memberTestDevReadonly,
} from '../mocks/teams/team';

export const getUserName = (roleName: string) => {
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
