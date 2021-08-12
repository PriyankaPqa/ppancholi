import { IHttpClient } from '@/services/httpClient';
import { DomainBaseService } from '@/services/base';
import { ICaseFileDocumentEntity } from '@/entities/case-file-document';
import { ICaseFileDocumentsService } from './case-file-documents.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'documents';
interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseFileDocumentsService extends DomainBaseService<ICaseFileDocumentEntity, UrlParams>
  implements ICaseFileDocumentsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async updateDocument(item: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity> {
    return this.http.patch<ICaseFileDocumentEntity>(this.getItemUrl(`${this.baseUrl}/{id}/edit`, item), item);
  }

  async downloadDocumentAsUrl(item: ICaseFileDocumentEntity, saveDownloadedFile: boolean) {
    return this.http.get<BlobPart>(this.getItemUrl(`${this.baseUrl}/{id}/file`, item), { responseType: 'blob' }).then(
      (data) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        if (saveDownloadedFile) {
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', item.originalFilename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return url;
      },
    );
  }
}
