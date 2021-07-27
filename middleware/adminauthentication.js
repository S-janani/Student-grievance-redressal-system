module.exports=(req,res,next)=>{
    if(!req.session.admin){
    return res.redirect('/adminlogin/');}
    if(!req.session.isLoggedIn){
    return res.redirect('/adminlogin/');}
    next();
    }


    