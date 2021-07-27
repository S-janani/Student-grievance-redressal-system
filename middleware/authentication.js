module.exports=(req,res,next)=>{
    if(!req.session.student){
    return res.redirect('/studentlogin/');}
    if(!req.session.isLoggedIn){
return res.redirect('/studentlogin/');}
next();
}