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
