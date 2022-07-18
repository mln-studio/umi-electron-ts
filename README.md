# README

`@umijs/max` 模板项目，更多功能参考 [Umi Max 简介](https://next.umijs.org/zh-CN/docs/max/introduce)

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
