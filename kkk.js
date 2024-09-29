const argon2 = require('argon2')

argon2.hash('rjHadamesRalmeman').then((result) => {
    console.log(result)
}).catch((err) => {
    console.log(err)
});