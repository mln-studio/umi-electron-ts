# README

`@umijs/max` 模板项目，更多功能参考 [Umi Max 简介](https://next.umijs.org/zh-CN/docs/max/introduce)

## Configuration used **config/config.ts** or **.umirc.ts**

```typescript
import { defineConfig } from '@umijs/max';

export default defineConfig({
  plugins: [`${__dirname}/plugin.electron.main`],
  electron: {
    main: 'electron',
    port: 5858, // electron debug port
  },
});
```

## Commit message format

### References

1. [Commitizen](https://github.com/commitizen/cz-cli)
2. [Commit message 和 Change log 编写指南](http://www.ruanyifeng.com/blog/2016/01/commit_message_change_log.html)

### Install [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli) & [commitizen](https://github.com/commitizen/cz-cli)

```bash
$ yarn global add commitizen conventional-changelog-cli

# initialize your project to use the cz-conventional-changelog adapter by typing:
commitizen init cz-conventional-changelog --yarn --dev --exact
conventional-changelog -p angular -i CHANGELOG.md -s
```

If this is your first time using this tool and you want to generate all previous changelogs, you could do

```bash
$ conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

More help for conventional-changelog:

```bash
$ conventional-changelog --help
```

### Add script to package.json

```javascript
{
  "scripts": {
    "commit": "cz",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -w -r 0"
  }
}
```

### Usage

```bash
$ git add .
$ yarn commit
cz-cli@4.2.5, cz-conventional-changelog@3.3.0

? Select the type of change that you're committing: (Use arrow keys)
❯ feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  refactor: A code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
  test:     Adding missing tests or correcting existing tests

```
