import webpack from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { IApi } from '@umijs/max';
import { chokidar } from '@umijs/utils';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
// import yargs from 'yargs'
import * as fse from 'fs-extra';
import * as path from 'path';

const getElectronSrcDir = (api: IApi) => {
  return path.join(api.paths.absSrcPath, 'electron');
};

const getElectronDevDir = (api: IApi) => {
  return path.join(api.paths.absTmpPath, 'electron');
};

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
  // config.node.set('__filename', false).set('__dirname', false)
  config.devtool(mode === 'development' ? 'inline-source-map' : false);
  config.resolve.extensions.add('.ts').add('.js');
  config.module.rule('ts').exclude.add(/node_modules/);
  config.module
    .rule('ts')
    .test(/\.ts?$/)
    .use('ts')
    .loader('ts-loader')
    .options({ transpileOnly: true });
  config.output.path(
    mode === 'development' ? getElectronDevDir(api) : api.paths.absOutputPath,
  );
  config.output.filename('[name].js');

  return config;
};

const buildMain = (api: IApi) => {
  const config = getBaseWebpackConfig(api);
  config.context(path.join(process.cwd(), 'src', 'electron'));
  config.entry('main').add(path.join(getElectronSrcDir(api), './main.ts'));
  config.target('electron-main');
  // config.output.library('main').libraryTarget('commonjs2')

  return build(config.toConfig());
};

const buildPreload = (api: IApi) => {
  api.logger.debug(`buildPreload called with ${api.name} plugin.`);
};

const runDev = async (api: IApi) => {
  const { port } = api.config;
  const electronPath = require(path.join(
    api.paths.absNodeModulesPath,
    'electron',
  ));
  let spawnProcess: ChildProcessWithoutNullStreams | null = null;

  const runMain = () => {
    if (spawnProcess !== null) {
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

const buildDist = (api: IApi) => {
  const { build } = api.config.electron;
  const outputDir = api.paths.absOutputPath;

  api.pkg.main = 'main.js';
  delete api.pkg.devDependencies;
  delete api.pkg.scripts;
  delete api.pkg.config;

  // TODO: Exclude dependencies
  fse.ensureDirSync(`${api.paths.absOutputPath}/node_modules`);
  fse.writeFileSync(
    `${outputDir}/package.json`,
    JSON.stringify(api.pkg, null, 2),
  );

  // const { configureBuildCommand } = require('electron-builder/out/builder')
  // const builderArgs = yargs
  //   .command(['build', '*'], 'Build', configureBuildCommand)
  //   .parse(process.argv)
  // api.logger.info(JSON.stringify(builderArgs, null, 2))
  require('electron-builder')
    .build({
      config: {
        directories: {
          output: outputDir,
          app: outputDir,
        },
        files: ['**'],
        extends: null,
        ...build,
        // ...builderArgs,
      },
    })
    .then(() => {
      api.logger.info('build electron success');
    });
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
          build: joi.object(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.registerCommand({
    name: 'electron',
    fn({ args }) {
      const arg = args._[0];
      if (arg === 'init') {
        api.logger.debug('registerCommand called for "electron init".');
      }
    },
  });

  // start dev electron
  api.onStart(() => {
    api.logger.info('Starting...');
    runBuild(api);
  });

  api.onDevCompileDone(({ isFirstCompile }) => {
    if (isFirstCompile) {
      api.logger.event('Run electron main process.');
      runDev(api).catch((err) => {
        console.error(err);
      });
    }
  });

  api.onBuildComplete(({ err }) => {
    api.logger.event('Start to build electron app...');

    if (err === null) {
      buildDist(api);
    }
  });
};
