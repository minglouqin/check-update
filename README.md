# Demo示例
## @tpaykit/check-update
1. 引入Hooks
```js
// App.vue
import { useCheckUpdate } from '@tpaykit/check-update'
import { Modal } from 'ant-design-vue'

const { onUpdate, onCancel } = useCheckUpdate(() => {
  Modal.confirm({
    title: '发现新版本',
    content: '是否更新到最新版本?',
    onOk: () => onUpdate(),
    onCancel: () => onCancel()
  })
})
```

2. 引入插件(按需引入)
构建后在dist目录生成version.json; 
按需引入, 读取html对比时无需引入插件
```js
// vite.config.ts
import { genVersionPlugin } from '@tpaykit/check-update/plugins'

export default defineConfig({
  plugins: [
    ...,
    genVersionPlugin(),
  ]
})
```

# API
## useCheckUpdate
| 属性        ｜ 说明                      ｜ 类型                ｜ 默认值           ｜
| -----------｜---------------------------｜--------------------｜-----------------｜
| interval   ｜ 轮询间隔(单位: 毫秒)         ｜ `number`           ｜`300000` (5分钟) ｜
| type       | 检测类型                     |  `version \| html`  | `version`       |  
| enabled    | 是否启用(如: 仅在生成环境开启)  | `boolean`           | `true`          |
| immediate  | 是否立即执行                 | `boolean`           | `true`          |


