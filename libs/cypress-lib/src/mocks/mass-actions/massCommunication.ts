import { getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';
import { MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';

export interface MockCreateMassCommunicationFileRequestParams {
  eventId: string,
  method: MassActionCommunicationMethod,
  messageSubject: Record<string, string>,
  message: Record<string, string>,
  attachments?: any,
  fileContents: string,
}

export const mockCreateMassCommunicationFileRequest = (params: MockCreateMassCommunicationFileRequestParams) => {
  const data = new FormData();

  data.append('eventId', params.eventId);
  data.append('messageSubject', JSON.stringify(params.messageSubject));
  data.append('message', JSON.stringify(params.message));
  data.append('method', JSON.stringify(params.method));
  data.append('name', `test mass communidation - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass communication via upload file');

  const blob = new Blob([params.fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};
