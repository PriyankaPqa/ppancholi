import Routes from '@/constants/routes';
import { RouteConfig } from 'vue-router';
import { UserRoles } from '@libs/entities-lib/user';

const AssessmentTemplatesHome = () => import('@/ui/views/pages/assessment-templates/home/AssessmentTemplatesHome.vue');
const AssessmentTemplatesEdit = () => import('@/ui/views/pages/assessment-templates/details/CreateEditAssessmentTemplate.vue');
const AssessmentTemplateDetails = () => import('@/ui/views/pages/assessment-templates/details/AssessmentTemplateDetails.vue');

export const assessmentTemplates: Array<RouteConfig> = [
  {
    path: Routes.assessmentTemplates.home.path,
    name: Routes.assessmentTemplates.home.name,
    component: AssessmentTemplatesHome,
    meta: {
      level: UserRoles.level6, requiresAuthorization: true, requiresAuthentication: true,
    },
  },
  {
    path: Routes.assessmentTemplates.create.path,
    name: Routes.assessmentTemplates.create.name,
    component: AssessmentTemplatesEdit,
    meta: {
      level: UserRoles.level6, requiresAuthorization: true, requiresAuthentication: true,
    },
    props: true,
  },
  {
    path: Routes.assessmentTemplates.duplicate.path,
    name: Routes.assessmentTemplates.duplicate.name,
    component: AssessmentTemplatesEdit,
    meta: {
      level: UserRoles.level6, requiresAuthorization: true, requiresAuthentication: true,
    },
    props: true,
  },
  {
    path: Routes.assessmentTemplates.edit.path,
    name: Routes.assessmentTemplates.edit.name,
    component: AssessmentTemplatesEdit,
    meta: {
      level: UserRoles.level6, requiresAuthorization: true,
    },
    props: true,
  },
  {
    path: Routes.assessmentTemplates.details.path,
    name: Routes.assessmentTemplates.details.name,
    component: AssessmentTemplateDetails,
    meta: {
      level: UserRoles.level6, requiresAuthorization: true,
    },
    props: true,
  },
];
