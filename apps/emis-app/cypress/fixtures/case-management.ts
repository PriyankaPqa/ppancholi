import { ICaseNotesData } from '../pages/casefiles/caseNotes.page';

export const fixtureCaseNotes = (retries: number): ICaseNotesData => ({
  subject: `Case Notes - retries${retries}`,
  category: ' Action log ',
  description: 'Case Notes Description En',
});
