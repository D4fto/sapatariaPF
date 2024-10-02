const argon2 = require("argon2")
console.log(argon2.hash('amostradinho'))
const localStrategy = require("passport-local").Strategy
const {connection} =  require("../mysql/connection")

// { Pessoa_cpf_Pessoa: '10101010101', Senha_Funcionario: 'YLCSX449' }
// { Pessoa_cpf_Pessoa: '11111111111', Senha_Funcionario: 'PKXlf885' }
// { Pessoa_cpf_Pessoa: '11111111112', Senha_Funcionario: 'AopfR292' }
// { Pessoa_cpf_Pessoa: '12121212121', Senha_Funcionario: 'radoK890' }
// { Pessoa_cpf_Pessoa: '13131313131', Senha_Funcionario: 'qGbBW259' }
// { Pessoa_cpf_Pessoa: '14141414141', Senha_Funcionario: 'FBSAu717' }
// { Pessoa_cpf_Pessoa: '15151515151', Senha_Funcionario: 'GNxpD526' }
// { Pessoa_cpf_Pessoa: '16161616161', Senha_Funcionario: 'ybHhz186' }
// { Pessoa_cpf_Pessoa: '17171717171', Senha_Funcionario: 'hfNnO194' }
// { Pessoa_cpf_Pessoa: '18181818181', Senha_Funcionario: 'YvPrE128' }
// { Pessoa_cpf_Pessoa: '19191919191', Senha_Funcionario: 'aKyuy068' }
// { Pessoa_cpf_Pessoa: '20202020202', Senha_Funcionario: 'RALws964' }
// { Pessoa_cpf_Pessoa: '22222222222', Senha_Funcionario: 'ROLnx453' }
// { Pessoa_cpf_Pessoa: '33333333333', Senha_Funcionario: 'wRANN040' }
// { Pessoa_cpf_Pessoa: '44444444444', Senha_Funcionario: 'TISrg380' }
// { Pessoa_cpf_Pessoa: '55555555555', Senha_Funcionario: 'qCyHc080' }
// { Pessoa_cpf_Pessoa: '66666666666', Senha_Funcionario: 'dQIln905' }
// { Pessoa_cpf_Pessoa: '77777777777', Senha_Funcionario: 'IrazF073' }
// { Pessoa_cpf_Pessoa: '88888888888', Senha_Funcionario: 'nEEfH847' }
// { Pessoa_cpf_Pessoa: '99999999999', Senha_Funcionario: 'MKqHt551' }

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'cpf', passwordField: 'password'}, (cpf, password, done) => {
        console.log(cpf)
        connection.execute(
            'SELECT Funcionario.*, Nome_Pessoa, telefone_Pessoa FROM Funcionario, Pessoa WHERE Pessoa_cpf_Pessoa = ? and Pessoa_cpf_Pessoa = cpf_Pessoa',
            [cpf],
            function (err, usuario) {
                console.log(usuario)
                usuario=usuario[0]
                if (err === null) {
                    if (usuario === undefined) {
                        console.log('cpf not');
                        return done(null, false, { message: "cpf não cadastrado" });
                    }
                    argon2.verify(usuario.Senha_Funcionario, password).then((batem) => {
                        if (batem) {
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
        done(null, usuario.Pessoa_cpf_Pessoa)
    })
    passport.deserializeUser((cpf, done)=>{
        connection.execute('SELECT Funcionario.*, Nome_Pessoa, telefone_Pessoa FROM Funcionario, Pessoa WHERE Pessoa_cpf_Pessoa = ? and Pessoa_cpf_Pessoa = cpf_Pessoa',[cpf],(err,usuario)=>{
            usuario=usuario[0]
            done(null, usuario)
        })
    })
}