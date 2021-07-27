const mongoose=require("mongoose");
const schema=mongoose.Schema;

const studentSchema=new mongoose.Schema(
    {
        name:
        {
            type:String,
            required:true
        },
        regno:
        {
            type:Number
        },
        email:
        {
            type:String,
            
        },
        contactno:
        {
            type:Number,
            required:true
        },
        password:
        {
            type:String,
            required:true
        
        },
        complaints:
        {
          items:[{
          complaintId:{
              type: schema.Types.ObjectId,
              ref:'Complaint',
              required:true
                      }           
              }]  
        }
    }
);
module.exports=mongoose.model("Student",studentSchema);
