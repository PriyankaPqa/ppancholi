import {
  ITenantSettingsEntity,
  IdParams,
  TenantSettingsEntity,
  FeatureKeys,
  ITenantSettingsEntityData,
  IBrandingEntity,
  IFeatureEntity,
  IBrandingEntityData,
  ICreateTenantSettingsRequest, ISetDomainsRequest, IEditColoursRequest, IEditTenantDetailsRequest, IValidateCaptchaAllowedIpAddressResponse,
} from '@libs/entities-lib/tenantSettings';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@libs/services-lib/tenantSettings/entity';
import { ref } from 'vue';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';
import { IMultilingual } from '@libs/shared-lib/types';
import { BaseStoreComponents } from '../base';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ITenantSettingsEntity, IdParams>,
  entityService: ITenantSettingsService | ITenantSettingsServiceMock,
) {
  const currentTenantSettings = ref(new TenantSettingsEntity());

  const recaptcha = ref({
    ipAddressIsAllowed: false,
    clientIpAddress: '',
  });

  function isFeatureEnabled(featureKey: FeatureKeys): boolean {
    return currentTenantSettings.value?.features?.find((f) => f.key === featureKey)?.enabled || false;
  }

  function getBranding() {
    return currentTenantSettings.value.branding;
  }

  function updateTheme(branding: IBrandingEntity) {
    const { colours } = branding;

    const lightTheme = vuetify.framework.theme.themes.light;

    const { primary }: any = lightTheme;
    primary.base = colours.primary;
    primary.lighten2 = colours.primaryLight;
    primary.darken1 = colours.primaryDark;

    const { secondary }: any = lightTheme;
    secondary.base = colours.secondary;
  }

  function setCurrentTenantSettings(tenantSettingsData: ITenantSettingsEntityData) {
    currentTenantSettings.value = new TenantSettingsEntity(tenantSettingsData);

    updateTheme(currentTenantSettings.value.branding);
  }

  function setBranding(brandingData: IBrandingEntityData) {
    currentTenantSettings.value.branding = {
      ...brandingData,
      showName: !brandingData.hideName,
    };

    updateTheme(currentTenantSettings.value.branding);
  }

  async function fetchCurrentTenantSettings(): Promise<ITenantSettingsEntityData> {
    const result = await entityService.getCurrentTenantSettings();
    try {
      if (result) {
        // force a new date because BE does not always update it
        result.timestamp = new Date();
        setCurrentTenantSettings(result);
      }
      return result;
    } catch {
      throw new Error('fetchCurrentTenantSettings');
      return null;
    }
  }

  async function createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData> {
    const result = await entityService.createTenantSettings(payload);

    if (result) {
      setCurrentTenantSettings(result);
    }

    return result;
  }

  async function createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData> {
    const result = await entityService.createTenantDomains(payload);

    if (result) {
      setCurrentTenantSettings(result);
    }

    return result;
  }

  async function enableFeature(featureId: uuid): Promise<ITenantSettingsEntityData> {
    const result = await entityService.enableFeature(featureId);
    if (result) {
      setCurrentTenantSettings(result);
    }

    return result;
  }

  async function disableFeature(featureId: uuid): Promise<ITenantSettingsEntityData> {
    const result = await entityService.disableFeature(featureId);
    if (result) {
      setCurrentTenantSettings(result);
    }

    return result;
  }

  async function fetchUserTenants(): Promise<IBrandingEntity[]> {
    const results = await entityService.getUserTenants();

    if (results) {
      return results.map((branding: IBrandingEntityData) => ({
        ...branding,
        showName: !branding.hideName,
      }));
    }
    return [];
  }

  async function updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntity> {
    const result = await entityService.updateColours(payload);

    if (result) {
      setCurrentTenantSettings(result);
    }

    return new TenantSettingsEntity(result);
  }

  async function updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntity> {
    const result = await entityService.updateTenantDetails(payload);
    if (result) {
      setCurrentTenantSettings(result);
    }

    return new TenantSettingsEntity(result);
  }

  async function fetchPublicFeatures(): Promise<IFeatureEntity[]> {
    const result = await entityService.getPublicFeatures();

    if (result) {
      currentTenantSettings.value.features = result;
    }

    return result;
  }

  async function validateCaptchaAllowedIpAddress(): Promise<IValidateCaptchaAllowedIpAddressResponse> {
    const result = await entityService.validateCaptchaAllowedIpAddress();
    if (result) {
      recaptcha.value = result;
    }

    return result;
  }

  async function fetchBranding(): Promise<IBrandingEntity> {
    const result = await entityService.getBranding();

    if (result) {
      setBranding(result);
    }

    return result;
  }

  async function updateSupportEmails(payload: IMultilingual): Promise<ITenantSettingsEntity> {
    const result = await entityService.updateSupportEmails(payload);

    if (result) {
      setCurrentTenantSettings(result);
    }

    return new TenantSettingsEntity(result);
  }

  return {
    currentTenantSettings,
    recaptcha,
    isFeatureEnabled,
    getBranding,
    setCurrentTenantSettings,
    setBranding,
    fetchCurrentTenantSettings,
    createTenantSettings,
    createTenantDomains,
    enableFeature,
    disableFeature,
    fetchUserTenants,
    updateColours,
    updateTenantDetails,
    fetchPublicFeatures,
    validateCaptchaAllowedIpAddress,
    fetchBranding,
    updateTheme,
    updateSupportEmails,
  };
}
