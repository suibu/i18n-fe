const ejs = require('ejs')
const html = `
<div><%= user.name %></div>
<div><%= user.age %></div>`
const options = {}


// 第1种方法 compile：返回解析完成的HTML代码
const data = {
  user: {
    name: 'nienie',
    age: '22',
    nickname: '<div>bobobobo</div>'
  }
}
const template = ejs.compile(html, options)
const compileTemplate = template(data)
console.log('compileTemplate', compileTemplate)
const data2 = {
  user: {
    name: 'suisui'
  }
}
const compileTemplate2 = template(data2)
console.log('compileTemplate2', compileTemplate2)

// 第2种方法 render：
const renderedTemplate = ejs.render(html, data, options)
console.log('renderedTemplate', renderedTemplate)


// 第2种方法 renderFile：
const path = require('path')
const filename = path.resolve(__dirname, 'index.html')
ejs.renderFile(filename, data, options, function(err, str){
  console.log('renderedFileTemplate', str)
});
