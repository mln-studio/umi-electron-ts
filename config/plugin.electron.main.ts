import webpack from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { IApi } from '@umijs/max';
import { chokidar } from '@umijs/utils';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';

const getElectronSrcDir = (api: IApi) => {
  return path.join(api.paths.absSrcPath, 'electron');
};

const getElectronDevDir = (api: IApi) => {
  return path.join(api.paths.absTmpPath, 'electron');
};

// const getElectronBuildDir = (api: IApi) => {
//   return path.join(api.paths.absOutputPath, 'electron')
// }

const build = async (config: webpack.Configuration) => {
  return await new Promise<void>((resolve, reject) => {
    const compiler = webpack(config);
    compiler.run((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const getBaseWebpackConfig = (api: IApi): Config => {
  const mode: 'none' | 'development' | 'production' =
    api.env === 'development' ? 'development' : 'production';
  const config = new Config();
  config.mode(mode);
  config.node.set('__filename', false).set('__dirname', false);
  config.devtool(mode === 'development' ? 'inline-source-map' : false);
  config.resolve.extensions.add('.ts').add('.js');
  //   // .options({ transpileOnly: true });
  config.output.path(getElectronDevDir(api));
  config.output.filename('[name].js');

  return config;
};

const buildMain = (api: IApi) => {
  console.log(`buildMain called with ${api.name} plugin.`);
  const config = getBaseWebpackConfig(api);
  config.context(path.join(process.cwd(), 'src', 'electron'));
  config.entry('main').add(path.join(getElectronSrcDir(api), './main.ts'));
  config.target('electron-main');
  config.output.library('main').libraryTarget('commonjs2');

  return build(config.toConfig());
};

const buildPreload = (api: IApi) => {
  console.debug(`buildPreload called with ${api.name} plugin.`);
};

const runDev = async (api: IApi) => {
  const { port } = api.config;
  const electronPath = require(path.join(
    api.paths.absNodeModulesPath,
    'electron',
  ));
  let spawnProcess: ChildProcessWithoutNullStreams | null = null;

  const runMain = () => {
    console.debug('runMain called.');
    if (spawnProcess !== null) {
      console.debug('spawnProcess killed.');
      spawnProcess.kill('SIGKILL');
      spawnProcess = null;
    }

    spawnProcess = spawn(electronPath, [
      `--inspect=${port}`,
      path.join(getElectronDevDir(api), 'main.js'),
    ]);

    spawnProcess.on('close', (code, signal) => {
      if (signal !== 'SIGKILL') {
        process.exit(-1);
      }
    });
    return spawnProcess;
  };

  chokidar
    .watch([`${getElectronSrcDir(api)}`, `${getElectronDevDir(api)}`], {
      ignoreInitial: true,
    })
    .on('unlink', (path) => {
      if (spawnProcess !== null && path.includes(getElectronDevDir(api))) {
        spawnProcess.kill('SIGKILL');
        spawnProcess = null;
      }
    })
    .on('change', (path) => {
      if (path.includes(getElectronSrcDir(api))) {
        return buildMain(api);
      }

      if (path.includes('main.js')) {
        return runMain();
      }
    });

  await runMain();
};

const runBuild = async (api: IApi) => {
  await buildMain(api);
  await buildPreload(api);
};

export default (api: IApi) => {
  api.describe({
    key: 'electron',
    config: {
      schema(joi) {
        return joi.object({
          main: joi.string(),
          renderer: joi.string(),
          preload: joi.string(),
          port: joi.number(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.registerCommand({
    name: 'electron',
    fn({ args }) {
      console.log(`electron command called with args: ${args}`);
      const arg = args._[0];
      if (arg === 'init') {
        console.log('electron:init command called.');
      }
    },
  });

  // start dev electron
  api.onStart(() => {
    console.log('api.onStart called.');
    runBuild(api);
  });

  api.onDevCompileDone(({ isFirstCompile }) => {
    console.debug(`isFirstCompile: ${isFirstCompile}`);
    if (isFirstCompile) {
      runDev(api).catch((err) => {
        console.error(err);
      });
    }
  });
};
