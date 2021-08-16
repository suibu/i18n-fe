const request = require('@i18n-fe/request')

const getProjectTempalte = async () => {
  try {
    const res = await request({ url: '/project/template'})
    return res
  } catch (e) {
    console.error(e.message)
    return [
      {
        name: '黑客增长UI模版',
        npmName: 'i18n-fe-template-vue3',
        version: '1.0.0-test.1',
        type: 'normal',
        command: {
          install: 'npm install --registry=https://registry.npm.taobao.org',
          start: 'npm run serve'
        }

      },
      {
        name: '内部系统管理后台模版-vue',
        npmName: 'i18n-fe-template-vue-element-admin',
        version: '1.0.0-test.1',
        type: 'normal',
        // type: 'custom',
        command: {
          install: 'npm install --registry=https://registry.npm.taobao.org',
          start: 'npm run serve'
        }
      }
    ]
  }
}

const getComponentTempalte = async () => {
  try {
    const res = await request({ url: '/component/template'})
    return res
  } catch (e) {
    console.error(e.message)
    return [
      {
        name: '通用组件',
        npmName: 'i18n-fe-template-component',
        version: '1.0.0-test.1',
      }
    ]
  }
}

module.exports = {
  getProjectTempalte,
  getComponentTempalte
}