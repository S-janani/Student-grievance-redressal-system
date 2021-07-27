const Head=require("../models/head");
const Complaint=require("../models/Complaint");
const Admin=require("../models/admin");
const { request } = require("express");
const nodemailer  = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgridTransport({
  auth : {
          api_key :process.env.MAIL//this api key from sendgrip website login and get api from it you can use any website  
  }
}));

const ITEMS_PER_PAGE = 10;
exports.add=(req,res,next)=>
{
    res.render('add');
};
exports.login=(req,res,next)=>
{
res.render('adminlogin');
};
exports.logins=(req,res,next)=>
{
    const email=req.body.email
    const password=req.body.password;
    Admin.findOne({email:email})
    .then(admin=>{
        console.log(admin);
        if(admin.password==password){       
             req.session.isLoggedIn=true;
        req.session.admin=admin;
        return req.session.save(err=>{
            console.log(err);
            res.redirect('/admincomplaints/');
          });
        }
        else{
            res.redirect('/adminlogin/');
        }
      })
      .catch(err=>{
        console.log(err);
        res.redirect('/');
      }); 
};
exports.addmembers=(req,res,next)=>
{
    const  name=req.body.name;
    const contact=req.body.contactno;
    const email=req.body.email;
    const department=req.body.category;
    const password=contact.substring(0,6).concat(department.substring(0,3),name.substring(0,3));
    console.log(password);
      const head=new Head(
          {
              name:name,

              contactno:contact,
              email:email,
              department:department,
              password:password
          }
      );
      console.log(head);
      head.save()
      .then(data=>{ 
        console.log(data);
        res.redirect('/admincomplaints/');
        return transporter.sendMail({
              to: email,
              from: 'studentgrievancecommission@outlook.com',
              subject: `Chosed as a head person of ${data.department}!`,
              html: `<h1>Your credentials are </h1>
              <p>Username : ${data.email}</p>
              <p>Password : ${data.password}</p>`
            })
            .then(result=>
              {
          console.log("email send");
              })
              .catch(err =>
                  {
                      console.log(err);
                  }) 
      })
      .catch(err=>{
      console.log(err);
      });
};
exports.delete=(req,res,next)=>
{
    res.render('delete');
}
exports.search=(req,res,next)=>{
    const category=req.body.category;
    console.log(category);
    Head.find({
        department:category
    })
    .then(result=>{
        console.log(result);
        res.json({members:result,length:result.length});
    })
    .catch(err=>{
        console.log(err);
    });

}
exports.deletemembers=(req,res,next)=>{
    const contact=req.body.contactno;
    //console.log(email);
    Head.deleteOne({ contactno:contact })
    .then(result=>{
        console.log(result);
        res.json({success:1});
    })
    .catch(err=>{
        console.log(err);
    });

}
exports.getcomplaints=(req,res,next)=>
{
    const page = +req.query.page || 1;
    let totalItems;``
    Complaint.find({escalate:0,status:1,reopen:0}).countDocuments()
     .then(numProducts => {
        totalItems = numProducts;
        return Complaint.find({escalate:0,status:1,reopen:0})
        .skip((page - 1) * ITEMS_PER_PAGE)//page- 1 = previous page number
        .limit(ITEMS_PER_PAGE).sort([["priority","ascending"],["created_at","ascending"]])
      })
      .then(complaints => {
        res.render('admincomplaints', {
          passcomplaints: complaints,
          title: 'Complaints',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      })
      .catch(err => {
        console.log(err);
      });
}
exports.escalate=(req,res,next)=>
{
   Complaint.find({escalate:1,status:1})
   .then(complaints=>{
     res.render('escalated',{
        passcomplaints: complaints,
        title:'escalated complaints'
     })
   })
   .catch(err=>
    {
        console.log(err);
    });
}

exports.reopen=(req,res,next)=>
{
   Complaint.find({reopen:1,status:1})
   .then(complaints=>{
     res.render('reopen',{
        passcomplaints: complaints,
        title:'reopen complaints'
     })
   })
   .catch(err=>
    {
        console.log(err);
    });
}

exports.forward=(req,res,next)=>{
const complaintid=req.body.complaintid;
Complaint.findById({_id:complaintid})
.then(result=>{
result.status=2;
res.json({sucess:1});
return result.save();
})
.catch(err=>{
    console.log(err);
});

};
exports.escalateforward=(req,res,next)=>{
  const complaintid=req.body.complaintid;
  console.log(complaintid);
  Complaint.findById({_id:complaintid})
  .then(result=>{
    console.log(result);
  result.status=2;
  res.json({success:1});
  return result.save();
  })
  .catch(err=>{
      console.log(err);
  });
};
exports.reopenforward=(req,res,next)=>{
  const complaintid=req.body.complaintid;
  console.log(complaintid);
  Complaint.findById({_id:complaintid})
  .then(result=>{
    console.log(result);
  result.status=2;
  res.json({success:1});
  return result.save();
  }) 
  .catch(err=>{
      console.log(err);
  });
};

exports.detailsection=(req,res,next)=>{
  const complaintid=req.body.complaintid;
  console.log("details");
  Complaint.findById({_id:complaintid})
  .then(result=>{
  res.json({complaint:result});
  })
  .catch(err=>{
    console.log(err);
  })
  
  };
exports.logout=(req,res,next)=>{
  console.log("logout admin");
  req.session.destroy(err=>{
    console.log(err);
    res.redirect('/');
  });
  };
