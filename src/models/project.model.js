const mongoose = require("mongoose") ;
const projectSchema = new mongoose.Schema(
    {
        title :
        {
            type : String ,
            required : true ,
            trim : true 
        },
        description :
        {
            type : String ,
            required : true ,
            trim : true ,
        },
        requiredSkills : 
        [
            {
                type : mongoose.Schema.Types.ObjectId ,
                ref : 'Skill' ,
            }
        ] , 
        owner :
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref : "User" ,
            required : true ,
        } ,
        status :
        {
            type : String ,
            enum : ["open" ,"closed"],
            default : "open" ,
        },
    } ,
    {
        timestamps : true 
    }
);
module.exports = mongoose.model("project" , projectSchema) ;