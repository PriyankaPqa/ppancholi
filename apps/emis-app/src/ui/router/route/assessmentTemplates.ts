import Routes from '@/constants/routes';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { RouteConfig } from 'vue-router';

const AssessmentTemplatesHome = () => import('@/ui/views/pages/assessment-templates/home/AssessmentTemplatesHome.vue');
const AssessmentTemplatesEdit = () => import('@/ui/views/pages/assessment-templates/details/CreateEditAssessmentTemplate.vue');
const AssessmentTemplateDetails = () => import('@/ui/views/pages/assessment-templates/details/AssessmentTemplateDetails.vue');

export const assessmentTemplates: Array<RouteConfig> = [
  {
    path: Routes.assessmentTemplates.home.path,
    name: Routes.assessmentTemplates.home.name,
    component: AssessmentTemplatesHome,
    meta: {
      level: 'level6', requiresAuthorization: true, requiresAuthentication: true, feature: FeatureKeys.Assessments,
    },
  },
  {
    path: Routes.assessmentTemplates.create.path,
    name: Routes.assessmentTemplates.create.name,
    component: AssessmentTemplatesEdit,
    meta: {
      level: 'level6', requiresAuthorization: true, requiresAuthentication: true, feature: FeatureKeys.Assessments,
    },
    props: true,
  },
  {
    path: Routes.assessmentTemplates.duplicate.path,
    name: Routes.assessmentTemplates.duplicate.name,
    component: AssessmentTemplatesEdit,
    meta: {
      level: 'level6', requiresAuthorization: true, requiresAuthentication: true, feature: FeatureKeys.Assessments,
    },
    props: true,
  },
  {
    path: Routes.assessmentTemplates.edit.path,
    name: Routes.assessmentTemplates.edit.name,
    component: AssessmentTemplatesEdit,
    meta: {
      level: 'level6', requiresAuthorization: true, feature: FeatureKeys.Assessments,
    },
    props: true,
  },
  {
    path: Routes.assessmentTemplates.details.path,
    name: Routes.assessmentTemplates.details.name,
    component: AssessmentTemplateDetails,
    meta: {
      level: 'level6', requiresAuthorization: true, feature: FeatureKeys.Assessments,
    },
    props: true,
  },
];
