/**
 * @group store
 */

import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { TenantSettingsEntityModule } from './tenantSettingsEntity';
import { TenantSettingsService } from '@/services/tenantSettings/entity';
import { ITenantSettingsEntityState } from './tenantSettingsEntity.types';
import {
  mockCreateTenantSettingsRequest,
  mockSetDomainsRequest,
  mockTenantSettingsEntity,
  mockTenantSettingsEntityData,
  TenantSettingsEntity,
} from '@/entities/tenantSettings';

const service = new TenantSettingsService(httpClient);
let module: TenantSettingsEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ITenantSettingsEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>;

describe('>>> TenantSettings entity module', () => {
  beforeEach(() => {
    module = new TenantSettingsEntityModule(service);
  });

  describe('>> Getters', () => {
    describe('currentTenantSettings', () => {
      it('returns the currentTenantSettings', () => {
        module.state.currentTenantSettings = mockTenantSettingsEntity();

        const res = module.getters.currentTenantSettings(module.state);

        expect(res).toEqual(mockTenantSettingsEntity());
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setCurrentTenantSettings', () => {
      it('sets the current tenant settings', () => {
        const tenantSettingsData = mockTenantSettingsEntityData();

        module.mutations.setCurrentTenantSettings(module.state, tenantSettingsData);

        expect(module.state.currentTenantSettings).toEqual(new TenantSettingsEntity(tenantSettingsData));
      });
    });
  });

  describe('>> Actions', () => {
    describe('getCurrentTenantSettings', () => {
      it('calls the getCurrentTenantSettings service', async () => {
        module.service.getCurrentTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.getCurrentTenantSettings(actionContext);

        expect(module.service.getCurrentTenantSettings).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        module.service.getCurrentTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.getCurrentTenantSettings(actionContext);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('createTenantSettings', () => {
      it('calls the createTenantSettings service', async () => {
        module.service.createTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockCreateTenantSettingsRequest();

        await module.actions.createTenantSettings(actionContext, payload);

        expect(module.service.createTenantSettings).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        module.service.createTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockCreateTenantSettingsRequest();

        await module.actions.createTenantSettings(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('createTenantDomains', () => {
      it('calls the createTenantDomains service', async () => {
        module.service.createTenantDomains = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockSetDomainsRequest();

        await module.actions.createTenantDomains(actionContext, payload);

        expect(module.service.createTenantDomains).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        module.service.createTenantDomains = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockSetDomainsRequest();

        await module.actions.createTenantDomains(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });
  });
});
