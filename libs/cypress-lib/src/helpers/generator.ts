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

export function getCurrentDateString() {
  return format(Date.now(), 'yyyy-MM-dd-H-mm-ss');
}

export function generateRandomText(length = 5) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwyz123456789';
  for (let i = 0; i < length; i += 1) {
text += possible.charAt(Math.floor(Math.random() * possible.length));
}
  return text;
}

export function generateRandomEventName() {
  return `test-auto-event-${generateRandomText()}-${getCurrentDateString()}`;
}
