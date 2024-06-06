import { getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';

export const mockCreateMassActionImportPaymentStatusUploadFileRequest = (fileContents: string) => {
  const data = new FormData();

  data.append('name', `Test Mass Action - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass action');

  const blob = new Blob([fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};
