import { format } from 'date-fns';

export const today = `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`;

export function generateMultilingual(fr = '', en = '') {
  return {
    translation: {
      en,
      fr,
    },
  };
}

export function generateRandomText(length = 5) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwyz123456789';
  for (let i = 0; i < length; i += 1) {
text += possible.charAt(Math.floor(Math.random() * possible.length));
}
  return text;
}

export function generateRandomFinancialAssistanceName() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwyz123456789';
  for (let i = 0; i < 5; i += 1) {
text += possible.charAt(Math.floor(Math.random() * possible.length));
}

  return `test-financial-assistance-${text}-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`;
}

export function generateRandomAddressName() {
  return `rue ${generateRandomText()}`;
}

export function generateRandomEventName() {
  return `test-auto-event-${generateRandomText()}-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`;
}

export function generateRandomNoteSubject() {
  return `test-note-${generateRandomText()}-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`;
}

export function generateRandomReferralName() {
  return `test-referral-${generateRandomText()}-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`;
}

export function generateRandomTeamName() {
  return `test-auto-team-${generateRandomText()}${format(Date.now(), 'yyyyMMddHmmss')}`;
}

export function generateRandomUserName() {
  return `test-user-${generateRandomText()}`;
}

export function generateRandomValidPhoneNumber() {
  return (5145550000 + Math.floor(Math.random() * 1000)).toString();
}

export function generateRandomPostalCode() {
  let text = '';
  const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '123456789';

  for (let i = 0; i < 7; i += 1) {
    if (i === 0 || i === 2 || i === 5) {
      text += caps.charAt(Math.floor(Math.random() * caps.length));
    }
    if (i === 3) {
      text += ' ';
    }
    if (i === 1 || i === 4 || i === 6) {
      text += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
  }
  return text;
}

export function generateRandomPhoneNumberString() {
  let text = '(514) 555-';
  const numbers = '123456789';

  for (let i = 0; i < 4; i += 1) {
    text += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return text;
}

export function generateE164Number() {
  const phoneNumber = (5145550000 + Math.floor(Math.random() * 1000)).toString();
  return `+1${phoneNumber}`;
}

export function generateDateOfBirth() {
  const start = new Date(1920, 0, 1);
  const end = new Date(2000, 0, 1);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return `${date.toISOString().split('T')[0]}T00:00:00.000Z`;
}

export function getRandomLatitude() {
  return Math.random() * 90 * (Math.round(Math.random()) ? 1 : -1);
}

export function getRandomLongitude() {
  return Math.random() * 90 * (Math.round(Math.random()) ? 1 : -1);
}
