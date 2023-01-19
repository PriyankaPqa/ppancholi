import { httpClient } from '@/services/httpClient';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { ICaseFileReferralEntity, ICaseFileReferralMetadata, IdParams } from '@libs/entities-lib/case-file-referral';
import { CaseFileReferralsService } from '@libs/services-lib/case-file-referrals/entity';
import { CaseFileReferralsMetadataService } from '@libs/services-lib/case-file-referrals/metadata';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/case-file-referral/case-file-referral-extension';

export type Entity = ICaseFileReferralEntity;
export type Metadata = ICaseFileReferralMetadata;

const storeId = 'case-file-referral';
const entityService = new CaseFileReferralsService(httpClient);
const metadataService = new CaseFileReferralsMetadataService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useCaseFileReferralStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useCaseFileReferralMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
