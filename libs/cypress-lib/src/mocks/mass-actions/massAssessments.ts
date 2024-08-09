import { getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';

export interface MockCreateMassAssessmentsFileRequestParams {
  eventId: string,
  assessmentFormId: string,
  emailSubject: Record<string, string>,
  emailTopCustomContent: Record<string, string>,
  emailAdditionalDescription: Record<string, string>,
  fileContents: string,
}

export const mockCreateMassAssessmentsFileRequest = (params: MockCreateMassAssessmentsFileRequestParams) => {
  const data = new FormData();

  data.append('eventId', params.eventId);
  data.append('assessmentFormId', params.assessmentFormId);
  data.append('emailSubject', JSON.stringify(params.emailSubject));
  data.append('emailTopCustomContent', JSON.stringify(params.emailTopCustomContent));
  data.append('emailAdditionalDescription', JSON.stringify(params.emailAdditionalDescription));
  data.append('name', `test mass assessments - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass assessments via upload file');

  const blob = new Blob([params.fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};
