const mongoose=require("mongoose");
const schema=mongoose.Schema;
const escalateSchema=new mongoose.Schema(
    {
       category:{
           type:String,
           required:true
       },
       description:
       {
         type:String,
         required:true
       },
       attachmentname:
       {
           type:String
       },
       userId:{
           type:schema.Types.ObjectId,
           ref:'Student',
           required:true
       },
       status:{
           type:Number
       },
       created_at: {type: Date } 
    }
);
module.exports=mongoose.model("Escalate",escalateSchema);