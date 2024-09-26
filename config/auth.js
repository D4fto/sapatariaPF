const argon2 = require("argon2")
console.log(argon2.hash('amostradinho'))
const localStrategy = require("passport-local").Strategy
const {connection} =  require("../models/connection")



module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'cpf', passwordField: 'password'}, (cpf, password, done) => {
        Usuario.findOne({where: {cpf: cpf}}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: "cpf não cadastrado"})
            }
            argon2.verify(usuario.senha, password).then((batem) => {
                if(batem){
                    return done(null, usuario)
                }
                else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })

        })
    }))
    passport.serializeUser((usuario, done) => {
        done(null, usuario.cpf)
    })
    passport.deserializeUser((cpf, done)=>{
        Usuario.findByPk(cpf).then((usuario) => {
            done(null, usuario)
        })
    })
}