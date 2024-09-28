const argon2 = require("argon2")
console.log(argon2.hash('amostradinho'))
const localStrategy = require("passport-local").Strategy
const {connection} =  require("../mysql/connection")



module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'cpf', passwordField: 'password'}, (cpf, password, done) => {
        connection.execute(
            'SELECT * FROM Pessoa WHERE id_Pessoa = ? and Nome_Pessoa = ?',
            [cpf, password],
            function (err, usuario) {
                usuario=usuario[0]
                console.log(cpf)
                console.log(password)
                if (err === null) {
                    if (usuario === undefined) {
                        console.log('cpf not');
                        return done(null, false, { message: "cpf não cadastrado" });
                    }
                    argon2.verify('$argon2id$v=19$m=65536,t=3,p=4$wuhPC999zouOwao4adYjXQ$Ddl2YBsk+1uimaStmrWjNxMne5XLY5NQjSp4H5FEv5o', password).then((batem) => {
                        if (batem) {
                            console.log(usuario);
                            return done(null, usuario);
                        } else {
                            console.log('senha not');
                            return done(null, false, { message: "Senha incorreta" });
                        }
                    }).catch(err => {
                        return done(err);
                    });
                } else {
                    console.log(err);
                    return done(null, false, { message: err });
                }
            }
          );
    }))
    passport.serializeUser((usuario, done) => {
        console.log(usuario)
        done(null, usuario.id_Pessoa)
    })
    passport.deserializeUser((cpf, done)=>{
        connection.execute('SELECT * FROM Pessoa WHERE id_Pessoa = ?',[cpf],(err,usuario)=>{
            usuario=usuario[0]
            done(null, usuario)
        })
    })
}