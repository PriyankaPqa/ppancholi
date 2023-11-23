import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import { saveAs } from 'file-saver';

const ExcelJS = require('exceljs');

export const today = `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`;

export function getRandomNumber() {
  return Math.floor(Math.random() * 1001);
}

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

export function generateDateOfBirth() {
  const birthDate = faker.date.birthdate({ min: 16, max: 100, mode: 'age' });
  return `${birthDate.toISOString().split('T')[0]}T00:00:00.000Z`;
}

export function generateRandomEventName() {
  return `test-auto-event-${getCurrentDateString()}-s${getRandomNumber()}`;
}

export function generateRandomTeamName() {
  return `test-auto-team-${getCurrentDateString()}-s${getRandomNumber()}`;
}

export function generateCSVContent<T>(data: T[]): string {
  const header = `${Object.keys(data[0]).join(',')}\n`;
  const rows = data.map((entry) => Object.values(entry).join(',')).join('\n');
  return header + rows;
}

export interface IXlsxTableColumnProperties {
  name: string;
  totalsRowLabel?: string;
  totalsRowFunction?: string;
  filterButton?: boolean;
  style?: object;
}

export async function generateXlsxFile(columns: IXlsxTableColumnProperties[], rows: string[][], tableName: string, fileName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Correction');

  worksheet.addTable({
    name: tableName,
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyle',
      showRowStripes: true,
    },
    columns,
    rows,
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileExtension = '.xlsx';

  saveAs(new Blob([buffer]), fileName + fileExtension);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function removeSpecialCharacters(inputString: string) {
  return inputString.replace(/[^a-zA-Z0-9]/g, '');
}
