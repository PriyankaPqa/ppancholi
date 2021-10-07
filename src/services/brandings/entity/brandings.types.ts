import {
  IBrandingEntity, IBrandingEntityData, IEditColoursRequest, IEditTenantDetailsRequest,
} from '@/entities/branding';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';

export interface IBrandingsService extends IDomainBaseService<IBrandingEntity, uuid> {
  getUserTenants(): Promise<IBrandingEntityData[]>;
  updateColours(payload: IEditColoursRequest): Promise<IBrandingEntityData>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<IBrandingEntityData>;
  getLogoUrl(languageCode: string): Promise<string>;
}

export interface IBrandingsServiceMock extends IDomainBaseServiceMock<IBrandingEntity> {
  getUserTenants: jest.Mock<IBrandingEntityData[]>;
  updateColours: jest.Mock<IBrandingEntityData>;
  updateTenantDetails: jest.Mock<IBrandingEntityData>;
  getLogoUrl: jest.Mock<string>;
}
