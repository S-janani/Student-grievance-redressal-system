const mongoose=require("mongoose");
const schema=mongoose.Schema;
const complaintSchema=new mongoose.Schema(
    {
       category:{
          type:String,
          required:true
       },
       priority:{
          type:Number,
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
       escalate:{
           type:Number,
           default:0
       },
       reopen:{
        type:Number,
        default:0
    },
       created_at: {type: Date },
       start_at:{type:Date,default:new Date()}, 
    }
);
module.exports=mongoose.model("Complaint",complaintSchema);