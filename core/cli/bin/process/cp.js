console.log('iam child process')
console.log('child process pid', process.pid)
process.on('message', (msg) => {
    console.log('子进程收到消息', msg)
})
process.send('hi, 我正在向parent process 发送消息')