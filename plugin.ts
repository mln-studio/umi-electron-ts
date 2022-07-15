import { IApi } from "@umijs/max";

const defaultConfig = {

}

export default (api: IApi) => {
  api.describe({
    key: 'electronBuilder',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          main: joi.string(),
          renderer: joi.string(),
          preload: joi.string(),
        })
      },
    },
    enableBy: api.EnableBy.register,
  });

  // api.registerCommand({

  // });

  api.modifyWebpackConfig((memo, { webpack, env }) => {
    console.log(memo);
    console.log(webpack);
    console.log(env);
    return memo;
  });
}