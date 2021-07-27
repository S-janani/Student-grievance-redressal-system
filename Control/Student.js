var Classifier = require( 'wink-naive-bayes-text-classifier');
const Student=require("../models/Student");
const Complaint=require("../models/Complaint");
const Admin=require("../models/admin");
const PDFDocument=require('pdfkit');
const fs=require('fs');
const path=require('path');
const Escalate=require("../models/escalate");
const bcrypt=require('bcryptjs');
const natural =require('natural');
const nodemailer  = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { readSync } = require("fs");
const moongose=require('mongoose');
const { Console } = require("console");
const escalate = require("../models/escalate");
const transporter = nodemailer.createTransport(sendgridTransport({
  auth : {
          api_key :process.env.MAIL//this api key from sendgrip website login and get api from it you can use any website  
  }
}));
exports.studentsignin=(req,res,next)=>
{
    // const admin=new Admin({
    //   email:'varshinivelmurugan2000@gmail.com',
    //   password:'1234'
    //  });
    //  const mongoose=require("mongoose");
    //  admin.save().
    //  then(result=>
    //      {
    //  console.log(result);
    //      })
    //      .catch(err=>{
    //          console.log(err);
    //      });
         res.render('studentsignin');
};
 
exports.signininsert=(req,res,next)=>
{
   const name=req.body.name;
   const regno=req.body.regno;
   const emailid=req.body.emailid;
   const number=req.body.contactno;
   const password=req.body.password;
   bcrypt.hash(password,12)
         .then(hashedPassword=>{
             const student=new Student(
                   {
                   name:name,
                   regno:regno,
                   email:emailid,
                   contactno:number,
                   password:hashedPassword,
                   complaints:{items:[]}
                   });
               
                   return student.save();

         })
         .then(result => {
            //res.locals.session.email = email,
           // console.log("User created successfully!"),
            res.render('home');
            console.log("emailedeee");
            return transporter.sendMail({
              to: emailid,
              from: 'studentgrievancecommission@outlook.com',
              subject: 'Signup succeeded!',
              html: '<h1>You successfully signed up!</h1>'
            })
            .then(result=>
              {
          console.log("email send");
              })
              .catch(err =>
                  {
                      console.log(err);
                  }) 
          });
};
exports.studentlogin=(req,res,next)=>{
  res.render('studentlogin');
};

exports.login=(req,res,next)=>{
//console.login('login');
  const email=req.body.email;
const password=req.body.password;
Student.findOne({email:email})
.then(student=>{
  bcrypt
  .compare(password,student.password)
  .then(domatch=>{
    if(domatch){
      console.log('matched');
      req.session.isLoggedIn=true;
      req.session.student=student;
      return req.session.save(err=>{
        console.log(err);
        res.redirect('/studentdashboard');
      });
    }
    else{
      console.log('notmatched');
      res.redirect('/studentlogin');
    }
  })
  .catch(err=>{
    console.log('err');
    res.redirect('/');
  }); 
  
})
.catch(err => {
  console.log(err);
  res.render('studentsignin');
});
}; 
exports.studentdashboard=(req,res,next)=>{
   Complaint.find({userId:req.session.student._id})
   .then(complaints=>{
     console.log(complaints);
     res.render('studentdashboard',{
      title:'student',
      passcomplaints:complaints,
      name:req.session.student.name,
      regno:req.session.student.regno    
     });
    //  const invoiceName= 'invoice-' + 'mess'+ '.pdf';
    //  const invoicePath = path.join('data','invoices',invoiceName);
    //  const pdfDoc =  new PDFDocument();
    //  res.setHeader('Content-Type','application/pdf');//it willopen document in browser
    //  res.setHeader('Content-Disposition','inline; filename= "'+ invoiceName +' "');
    //  pdfDoc.pipe(fs.createWriteStream(invoicePath)); 
    //  pdfDoc.pipe(res);
    //  pdfDoc.text('The Complaint that the ..............................................................The problem is addressed by ....................................... on ............................................The management will ensure that these kinds of problems wont arise in the future');
    //  pdfDoc.end();

    
   })
  .catch(err=>{
    console.log(err);
  })
};
exports.logout=(req,res,next)=>{
console.log("logout student");
  req.session.destroy(err=>{
  console.log(err);
  res.redirect('/');
});
};
exports.registercomplaint=(req,res,next)=>{
  res.render('complaintregister',{
    name:req.session.student.name,
    regno:req.session.student.regno  
  });

};
exports.register=(req,res,next)=>{
 const data= require("../dataset.json");
 const des=req.body.des;
 console.log(des);
 const sta=1;
 const yesno=req.body.attachment;
 //apply or predict
 var nbc = Classifier();
 // Load NLP utilities
 var nlp = require( 'wink-nlp-utils' );
 // Configure preparation tasks
 nbc.definePrepTasks( [
   // Simple tokenizer
   nlp.string.tokenize0,
   // Common Stop Words Remover
   nlp.tokens.removeWords,
   // Stemmer to obtain base word
   nlp.tokens.stem
 ] );
 // Configure behavior 
 nbc.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
 // Train!
 const datas= require("../dataset.json");
 datas.forEach(item=>{
     nbc.learn( item.description,item.category);
   });
 // Consolidate all the training!!
 nbc.consolidate();
 const category= nbc.predict(des) ;
 //persisting save
 const prior=priority(category);
 //console.log(one);
 if(yesno==1)
 {
    const file=req.file;
    console.log(file);
    const attachmenturl=file.path;
    const complaint=new Complaint({
    category:category,
    priority:prior,
    description:des,
    attachmentname:attachmenturl,
    userId:req.session.student,
    status:sta,
    created_at:new Date()
    });
    console.log(complaint);
    complaint.save()
    .then(com =>
      {
      console.log('compalint registered');
     
      res.redirect('/studentdashboard/');
     
  return  transporter.sendMail({
    
    to: req.session.student.email,
    from: 'studentgrievancecommission@outlook.com',
    subject: 'Complaint registered successfully',
    html: `<body>
    <h1>Your Complaint registered successfully</h1>
    <h2>Your Complaint id :${com._id} </h2>
    <h3>Use this id for viewing the status of the complaint</h3>
    <a href="http://www.ausgc.herokuapp.com/status">
    Check Status </a>
    </body>`
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
     .catch(err =>
      {
       console.log(err);
      }); 
 }
 else
  {
  const complaint=new Complaint({
  category:category,
  description:des,
  priority:prior,
  userId:req.session.student,
  status:sta,
  created_at:new Date()
  });
  console.log(complaint);
  complaint.save()
  .then(com =>
    {
    console.log('compalint registered');
    res.redirect('/studentdashboard/');
    console.log(req.session.student.email);

  return  transporter.sendMail({
    to: req.session.student.email,
    from: 'studentgrievancecommission@outlook.com',
    subject: 'Complaint registered successfully',
    html: `<body>
    <h1>Your Complaint registered successfully</h1>
    <h2>Your Complaint id :${com._id} </h2>
    <h3>Use this id for viewing the status of the complaint</h3>
   <a href="http://ausgc.herokuapp.com.status">
    Check Status </a>
    F</body>`
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
   .catch(err =>
    {
     console.log(err);
    }); 
  }

  function priority(category)
  {
   if(category =='Irregularity in the admission process')
   return 2;
   if(category =='Exam related issues')
   return 2;
   if(category =='Hostel')
   return 3;
   if(category =='Mess')
   return 2;
   if(category =='SC/ST Cell')
   return 1;
   if(category =='Scholarschip irregularity') 
   return 3;
   if(category =='Ragging')
   return 1;
   if(category =='Sexual Harressment')
   return 1;
   if(category =='Library management')
   return 5;
   if(category =='College Eco Management') 
   return 4;
   if(category =='Health center') 
   return 1;
   if(category =='Online class')
   return 2;
  }
};
exports.status=(req,res,next)=>{
res.render('status',{
  name:req.session.student.name,
  regno:req.session.student.regno   
});
};
exports.statuscheck=(req,res,next)=>{
const id=req.body.complaintno;
console.log(id);
Complaint.findById({_id:id})
.then(complaint=>{
  console.log(complaint.status);
const stat=complaint.status;
res.json({status:stat});

})
.catch(err=>{
  console.log(err);
})
};
exports.escalation=(req,res,next)=>{
console.log("coming");
const complaintid=req.body.complaintid;
console.log(complaintid);
Complaint.findById({_id:complaintid})
.then(result=>{
const cat=result.category;
const nowdate=new Date();
const credate=result.created_at;
if(cat=="Irregularity in the admission process")
{
  //console.log(nowdate.getDate()-credate.getDate());
  //console.log('asdfa');
if((nowdate.getDate()-credate.getDate())>=0)
{
  console.log(nowdate.getDate()-credate.getDate());
  //escalateinsert();
  updatedate();
}
}
if(cat=="Exam Related Issues")
{
  if((nowdate.getDate()-credate.getDate())>=3)
{
  console.log(nowdate.getDate()-credate.getDate());
  //escalateinsert();
  updatedate();
}
}
if(cat=="Hostel")
{
  if((nowdate.getDate()-credate.getDate())>=10)
{
  console.log(nowdate.getDate()-credate.getDate());
  //escalateinsert();
  updatedate();
}
}
if(cat=="Mess")
{
  
  if((nowdate.getDate()-credate.getDate())>=0)
  {
    updatedate();
    console.log(nowdate.getDate()-credate.getDate());
   // escalateinsert();
  
  }
}
if(cat=="SC/ST Cell")
{
  if((nowdate.getDate()-credate.getDate())>=1)
  {
    console.log(nowdate.getDate()-credate.getDate());
    //escalateinsert();
    updatedate();
  }
}
if(cat=="Scholarship irregularity")
{
  if((nowdate.getDate()-credate.getDate())>=4)
  {
    console.log(nowdate.getDate()-credate.getDate());
    //escalateinsert();
    updatedate();
  }
}

if(cat=="Ragging")
{
  if((nowdate.getDate()-credate.getDate())>=1)
  {
    console.log(nowdate.getDate()-credate.getDate());
    //escalateinsert();
    updatedate();
  }
}
if(cat=="Sexual Harressement")
{
  if((nowdate.getDate()-credate.getDate())>=1)
  {
    console.log(nowdate.getDate()-credate.getDate());
    //escalateinsert();
    updatedate();
  }
}
if(cat=="Library management")
{
  if((nowdate.getDate()-credate.getDate())>=10)
  {
    console.log(nowdate.getDate()-credate.getDate());
    //escalateinsert();
    updatedate();
  }
}
if(cat=="College Eco Management")
{
  if((nowdate.getDate()-credate.getDate())>=10)
  {
    console.log(nowdate.getDate()-credate.getDate());
   // escalateinsert();
    updatedate();
  }
}
if(cat=="Health center")
{
  if((nowdate.getDate()-credate.getDate())>=1)
  {
    console.log(nowdate.getDate()-credate.getDate());
   // escalateinsert();
    updatedate();
  }
}
if(cat=="Online class")
{
  if((nowdate.getDate()-credate.getDate())>=0)
  {
    console.log(nowdate.getDate()-credate.getDate());
   // escalateinsert();
    updatedate();
  }
}
// function escalateinsert()
// {
//   if(result.attachmentname){
//     const escalate=new Escalate({
//      category:result.category,
//      description:result.description,
//      attachmentname:result.attachmentname,
//      userId:result.userId,
//      created_at:new Date()
//     });
//    return   escalate.save();
//   }
//   else{
//     const escalate=new Escalate({
//       category:result.category,
//       description:result.description,
//       //attachmentname:result.attachmentname,
//       userId:result.userId,
//       created_at:new Date()
//      });

//     return  escalate.save();
//   }
   
// }
function updatedate()
{
  console.log("esacalted");
  result.escalate=1;
  result.created_at=new Date();
  result.status=1;
  res.json({success:1});
  return result.save();
}
})
.catch(err=>{
console.log(err);
});
};
exports.openreport=(req,res,next)=>{
const complaintid=req.params.complaintid.substring(1);
console.log(complaintid);
console.log('report');
const filepat=path.join('data','invoice-'+complaintid+'.pdf');//itha vategory eduthurava
fs.readFile( filepat , function (err,data){//this for only viewing pdf
    res.contentType("application/pdf");
    res.send(data);
});
};
exports.reopen=(req,res,next)=>{
const complaintid=req.body.complaintid;
Complaint.findById({_id:complaintid})
.then(result=>{
result.status=1;
result.reopen=1;
res.json({success:1});
return result.save();
})
.catch(err=>{
  console.log(err);
})

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