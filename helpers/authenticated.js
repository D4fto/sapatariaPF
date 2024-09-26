module.exports = {
    authenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next()
        }
        req.flash("error_msg", "Você precisa estar logado para acessar esssa página")
        res.redirect('/home')
    }
}