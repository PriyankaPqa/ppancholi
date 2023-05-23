/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import Vuetify from 'vuetify';
import '@/ui/plugins/vee-validate';
import formatCurrency from '@/ui/plugins/formatCurrency';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import features from '@/ui/plugins/features';
import { getLocalVue, getWrapper } from '@libs/shared-lib/tests/testBase';
import { PiniaVuePlugin } from 'pinia';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import registrationStore from '@/ui/plugins/registrationStore';
import { UserRoles } from '@libs/entities-lib/user';

jest.setTimeout(10000);

const plugins = [
  Vuetify,
  features,
  formatCurrency,
  rolesAndPermissions,
  PiniaVuePlugin,
  registrationStore,
];

export const createLocalVue = () => getLocalVue(plugins);

const setFeature = async (featureKey, hasFeature, wrapper) => {
  const index = wrapper.vm.$options.featureList.indexOf(featureKey);
  if (hasFeature && index < 0) {
    wrapper.vm.$options.featureList.push(featureKey);
  }
  if (!hasFeature && index >= 0) {
    wrapper.vm.$options.featureList.splice(index, 1);
  }
  await wrapper.vm.$forceUpdate();
};

export const mount = (Component, options) => {
  const opts = {
    pinia: getPiniaForUser(UserRoles.level6),
    ...options,
  };
  const wrapper = getWrapper(Component, opts, {
    mountMethod: m,
  });
  wrapper.setFeature = async (featureKey, hasFeature) => {
    await setFeature(featureKey, hasFeature, wrapper);
  };
  return wrapper;
};

export const shallowMount = (Component, options) => {
  const opts = {
    pinia: getPiniaForUser(UserRoles.level6),
    ...options,
  };
  const wrapper = getWrapper(Component, opts, {
    mountMethod: sm,
  });
  wrapper.setFeature = async (featureKey, hasFeature) => {
    await setFeature(featureKey, hasFeature, wrapper);
  };
  return wrapper;
};
