 const childProcess = require('child_process')
 const path = require('path')

 // childProcess.exec('ls -al', (err, stdout, stderr) => {
 //     console.log(err)
 //     console.log(stdout)
 //     console.log(stderr)
 // })

 // 管道符 作筛选
 // childProcess.exec(path.resolve(__dirname, 'test1.shell'), {
 //     timeout: 0,
 //     cwd: path.resolve('../')
 // },(err, stdout, stderr) => {
 //     console.log(err)
 //     console.log(stdout)
 //     console.log(stderr)
 // })

 // childProcess.execFile('ls', ['-al'],(err, stdout, stderr) => {
 //     console.log(err)
 //     console.log(stdout)
 //     console.log(stderr)
 // })

 // __dirname 当前文件夹
 const shellPath = path.resolve(__dirname, 'test.shell')
 //
 // childProcess.execFile(shellPath, ['-al'], (err, stdout, stderr) => {
 //     console.log(err)
 //     console.log(stdout)
 //     console.log(stderr)
 // })

 // 没有回调，只有子进程
 // const chid = childProcess.spawn(shellPath, ['-al'], {
 //     cwd: path.resolve('../')
 // })
 //
 // console.log('子进程ID', chid.pid)
 // // 对子进程的成功结果进行监听
 // chid.stdout.on('data', (chunk) => {
 //    console.log('stdout', chunk.toString())
 // })
 // // 对子进程的错误结果进行监听
 // chid.stderr.on('data', (chunk) => {
 //     console.log('stderr', chunk.toString())
 // })
 //
 //
 // spawn 适合长任务，耗时任务，例如npm install ，不断输出日志
 // exec，execfile 开销比较小的任务

 // example：spawn
 // const child1 = childProcess.spawn('npm', ['install'], {
 //     cwd: path.resolve(__dirname)
 // })
 // child1.stdout.on('data', (chunk) => {
 //     console.log('stdout', chunk.toString())
 // })
 // child1.stderr.on('data', (chunk) => {
 //     console.log('stderr', chunk.toString())
 // })
 //
 // // 一下子出现结果
 // childProcess.exec('npm install', {
 //     cwd: path.resolve(__dirname)
 // },(err, stdout, stderr) => {
 //     console.log(err)
 //     console.log(stdout)
 //     console.log(stderr)
 // })


 // fork 使用场景：耗时操作：下载文件
 // fork 创建子进程，使用node去执行
const child = childProcess.fork(path.resolve(__dirname, 'cp.js'))// fork会创建子进程，相当于创建了两个进程
 // 直接执行指定的文件路径
 console.log('main pid', process.pid)
 child.send('hi, child', () => {
  // child.disconnect();
 }) // 向子进程发送消息
 child.on('message', (msg) => {
  console.log(msg)
  child.disconnect();
 })



 // 同步方法
 const ret = childProcess.execSync('ls -al|grep node_modules')
 console.log(ret.toString())
 const ret1 = childProcess.execFileSync('ls', ['-al'])
 console.log(ret1.toString())
 const ret3 = childProcess.spawnSync('ls', ['-al'])
 console.log(ret3.stdout.toString())