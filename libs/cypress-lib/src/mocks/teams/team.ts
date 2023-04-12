import { ITeamEntity, TeamType, ITeamMember } from '@libs/entities-lib/team';
import { generateRandomTeamName } from '../../helpers';

export const memberTestDev6 = '0c834919-3416-4297-86e4-f489f2bb15c2';
export const memberTestDev5 = 'e351ab0d-145a-43e9-be7e-593e8fc2edbc';
export const memberTestDev4 = 'c186243c-54aa-4b85-a680-8fd9e9b15d69';
export const memberTestDev3 = '1a6dad83-ab8d-4e87-a57e-f0dc5290f068';
export const memberTestDev2 = '9f3b0c51-213f-464e-b54c-557ffb28950d';
export const memberTestDev1 = '9a96f64e-f3c5-4628-b368-82414dda7162';
export const memberTestDev0 = 'c91d3e75-38e8-45f2-88a8-f2ee6501608d';
export const memberTestContributorIM = '143e49c6-96d5-4e82-adb1-f0bf69fd99b8';
export const memberTestContributorFinance = '564ae281-633a-4c85-a3a0-422ad8858f34';
export const memberTestContributor3 = 'c536b843-8c7f-417f-8382-3da3ed75480f';
export const memberTestDevReadonly = '2c45e3c7-fac0-4ab0-a31b-739c5bab83da';

export const mockTeams = (force?: Partial<ITeamEntity>): ITeamEntity => <ITeamEntity>({
  name: generateRandomTeamName(),
  teamType: TeamType.Standard,
  teamMembers: [] as ITeamMember[],
  eventIds: [] as string[],
  ...force,
});
