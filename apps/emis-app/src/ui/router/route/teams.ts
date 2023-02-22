import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router/types/router';
import { UserRoles } from '@libs/entities-lib/user';

const TeamsLayout = () => import('@/ui/views/pages/teams/layout/TeamsLayout.vue');
const TeamsHome = () => import('@/ui/views/pages/teams/home/TeamsHome.vue');
const CreateEditTeam = () => import('@/ui/views/pages/teams/create-edit/CreateEditTeam.vue');
const TeamDetails = () => import('@/ui/views/pages/teams/details/TeamDetails.vue');

export const teams: RouteConfig = {
  path: Routes.teams.layout.path,
  component: TeamsLayout,
  meta: {
    requiresAuthorization: true,
  },
  children: [
    {
      path: Routes.teams.home.path,
      name: Routes.teams.home.name,
      component: TeamsHome,
      meta: { level: UserRoles.level3 },
    },
    {
      path: Routes.teams.create.path,
      name: Routes.teams.create.name,
      component: CreateEditTeam,
      meta: { level: UserRoles.level5 },
      props: true,
    },
    {
      path: Routes.teams.edit.path,
      name: Routes.teams.edit.name,
      component: CreateEditTeam,
      meta: { level: UserRoles.level4 },
      props: true,
    },
    {
      path: Routes.teams.details.path,
      name: Routes.teams.details.name,
      component: TeamDetails,
      meta: { level: UserRoles.level3 },
      props: true,
    },
  ],
};
