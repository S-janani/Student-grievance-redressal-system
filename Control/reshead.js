const Head=require("../models/head");
const Complaint=require("../models/Complaint");
const ITEMS_PER_PAGE = 10;
const PDFDocument = require('pdfkit');
const fs=require('fs');
const path=require('path');
exports.login=(req,res,next)=>
{
res.render('reslogin');
};
exports.logins=(req,res,next)=>
{
    const email=req.body.email
    const password=req.body.password;
    console.log(email);
    Head.findOne({email:email})
    .then(head=>{
        console.log(head);
        if(head.password==password){       
             req.session.isLoggedIn=true;
        req.session.head=head;
        return req.session.save(err=>{
            console.log(err);
            res.redirect('/headcomplaints/');
          });
        }
        else{
            res.redirect('/reslogin/');
        }
      })
      .catch(err=>{
        console.log(err);
        res.redirect('/');
      }); 
};
exports.getcomplaints=(req,res,next)=>
{
    console.log(req.session.head.department);
    const page = +req.query.page || 1;
    let totalItems;``
    Complaint.find({category:req.session.head.department,$or:[{status:2},{status:3}]}).countDocuments()
     .then(numProducts => {
        totalItems = numProducts;
        return Complaint.find({category:req.session.head.department,$or:[{status:2},{status:3}]})
        .skip((page - 1) * ITEMS_PER_PAGE)//page- 1 = previous page number
        .limit(ITEMS_PER_PAGE).sort([["escalate","descending"],["created_at","ascending"]])
      })
      .then(complaints => {
          console.log(complaints);
          res.render('headcomplaints', {
          passcomplaints: complaints,
          title: 'Complaints',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          name:req.session.head.name,
          category:req.session.head.department
        });
      })
      .catch(err => {
        console.log(err);
      });
}

exports.complete=(req,res,next)=>{
const complaintid=req.body.complaintid;
console.log(complaintid);
// Complaint.findById({_id:complaintid})
// .then(result=>{
  // result.status=4;
  //  const startdate=result.start_at.getDate();
  //  const end=new Date();
  //  const enddate=end.getDate();
  res.render('report',{
    id:complaintid
  });
};


exports.logout=(req,res,next)=>{
  console.log("logout head"); 
  req.session.destroy(err=>{
      console.log(err);
      res.redirect('/');
    });
    };

exports.notify=(req,res,next)=>{
const complaintid=req.body.complaintid;
Complaint.findById({_id:complaintid})
.then(result=>{
result.status=3;

res.json({success:1});
return result.save();
})
.catch(err=>{
  console.log(err);
});
};
  exports.report=(req,res,next)=>{
    const complaintid=req.body.complaintid;
    const action=req.body.action;
   Complaint.findById({_id:complaintid})
  .then(result=>{
   result.status=4;
   const startdate=result.start_at.getDate();
   const end=new Date();
   const enddate=end.toISOString().substring(0, 10);
   const invoiceName= 'invoice-' +complaintid + '.pdf';
const invoicePath = path.join('data',invoiceName);
const imagePath=path.join('public','asset','AU1.jpeg');
console.log(invoicePath);
const pdfDoc =  new PDFDocument();
// res.setHeader('Content-Type','application/pdf');//it willopen document in browser
// res.setHeader('Content-Disposition','inline; filename= "'+ invoiceName +' "');
pdfDoc.pipe(fs.createWriteStream(invoicePath));
//pdfDoc.pipe(res);//redeable format

pdfDoc.image(imagePath, 90, 10, {fit: [60, 60], align: 'left', valign: 'left'});
   pdfDoc.fontSize(12).text('Student Grievance Redressal Committee' ,15,20,{align:'center'});
   pdfDoc.fontSize(12).text('College Of Engineering,Guindy' ,30,35,{align:'center',lineGap:2});
   pdfDoc.fontSize(12).text('Chennai' ,45,50,{align:'center'});
   pdfDoc.text('----------------------------------------------------------------------------------------------------------------------',65,70);
   pdfDoc.fontSize(12).text('Date :'+enddate ,430,105);
   pdfDoc.fontSize(12).text( 'The Registered Complaint is resolved on '+enddate+'.The action taken by the '+result.category+' department is '+action+'.The action is taken under the supervision of '+req.session.head.name+' Head of '+result.category+'.The management  ensures that this problem will not happen in the future',60,150,{lineGap:5,wordSpacing:4});  
   pdfDoc.fontSize(12).text(req.session.head.name,430);
   pdfDoc.fontSize(12).text('Head of '+result.category,430); 
   pdfDoc.end(); 
   result.status=5;
   result.escalate=0;
   result.reopen=0;
   return result.save().then(saved=>
    {
    console.log(saved);
    res.redirect('/headcomplaints/');
    })
    .catch(err=>
      {
     console.log(err);
      });
})
.catch(err=>{
  console.log(err);
})
};
exports.notifyescalate=(req,res,next)=>{

  Complaint.find({escalate:1,category:req.session.head.department,$or:[{status:2},{status:3}]}).countDocuments()
  .then(count=>{
    res.json({counts:count});
  })
  .catch(err=>
    {
    console.log(err);
    });
};
exports.notifyreopen=(req,res,next)=>{
 console.log("sdfs");
   Complaint.find({reopen:1,category:req.session.head.department,$or:[{status:2},{status:3}]}).countDocuments()
  .then(count=>{
    console.log(count);
    res.json({counte:count});  
  })
  .catch(err=>
    {
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