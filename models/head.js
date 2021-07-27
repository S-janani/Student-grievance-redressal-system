const mongoose=require("mongoose");
const schema=mongoose.Schema;
 
const headschema=new mongoose.Schema(
    {
        name:
        {
            type:String,
            required:true
        },
        contactno:
        {
            type:Number,
            required:true
        },
        email:
        {
            type:String,
            required:true
        },
        department:
        {
            type:String,
            required:true
        },
        password:
        {
            type:String

        }
    }
);
module.exports=mongoose.model("Head",headschema);