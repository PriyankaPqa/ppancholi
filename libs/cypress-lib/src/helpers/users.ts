export const getUserName = (roleName: string) => {
  const map = {
    Level6: 'TestDev6',
    Level5: 'TestDev5',
    Level4: 'TestDev4',
    Level3: 'TestDev3',
    Level2: 'testdev2',
    Level1: 'TestDev1',
  } as Record<string, string>;
  return map[roleName];
};

export const getUserRoleDescription = (roleName: string) => {
  const map = {
    Level6: 'System Admin',
    Level5: 'Systems Team Member',
  } as Record<string, string>;
  return map[roleName];
};
