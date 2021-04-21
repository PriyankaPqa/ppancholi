const devPresets = ['@vue/babel-preset-app'];
const buildPresets = ['@babel/preset-env', '@babel/preset-typescript'];
const testPresets = ['@vue/cli-plugin-babel/preset'];

let presets;

switch (process.env.NODE_ENV) {
  case 'development':
    presets = devPresets;
    break;
  case 'test':
    presets = testPresets;
    break;
  case 'production':
    presets = buildPresets;
    break;
  default:
    presets = buildPresets;
}

module.exports = {
  presets,
};
