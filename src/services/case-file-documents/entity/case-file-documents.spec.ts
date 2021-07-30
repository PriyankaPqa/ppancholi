/* eslint-disable */
// import { mockCaseFileDocumentEntity } from '@/entities/case-file-referral';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { CaseFileDocumentsService } from './case-file-documents';

describe('>>> Case File Document Service', () => {
  let http: IHttpMock;
  let service: CaseFileDocumentsService;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFileDocumentsService(http as never);
  });

  it('passes', ()=> {
    expect(true).toBeTruthy()
  })

});
