import { defineConfig } from '@umijs/max';
import routes from './routes';

export default defineConfig({
  antd: {
    configProvider: {},
    dark: true,
    compact: true,
    import: false,
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  plugins: [`${__dirname}/plugin.electron.main`],
  electron: {
    main: 'electron',
    port: 5858,
    build: {
      appId: 'org.melon.electron.demo',
      mac: {
        category: 'public.melon.electron',
      },
    },
  },
  routes,
  publicPath: './',
  npmClient: 'yarn',
});
