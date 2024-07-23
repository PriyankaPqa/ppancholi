import { generateXlsxFile, IXlsxTableColumnProperties } from '@libs/cypress-lib/helpers';

export const createTestXlsxFile = async (fileName: string) => {
  const columns: IXlsxTableColumnProperties[] = [
    { name: 'Name' },
    { name: 'Location' },
  ];

  const rows: string[][] = [
    ['Test1', 'CRC Quebec'],
    ['Test2', 'CRC Ontario'],
  ];

  const tableName = 'Test Table';

  await generateXlsxFile(columns, rows, tableName, fileName);
};
