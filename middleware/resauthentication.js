module.exports=(req,res,next)=>{
    if(!req.session.head){
    return res.redirect('/reslogin/');}
    if(!req.session.isLoggedIn){
    return res.redirect('/reslogin/');}
    next();
    }