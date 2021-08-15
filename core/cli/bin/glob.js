const glob = require('glob')

glob('*.js', {}, (err, file) => {
    console.log(file)
})

glob('**/*.js', {
    ignore: ['node_modules/**'
}, (err, file) => {
    console.log(file)
})