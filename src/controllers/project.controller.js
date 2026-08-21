
const Project = require ("../models/project.model") ;
const Skill = require("../models/skill.model");
const Profile = require("../models/profile.model") ;
async function createProject(req , res , next )
{
    try
    {
        const { title , description , requiredSkills } = req.body ;
        const project = await Project.create(
            {
                title ,
                description ,
                requiredSkills ,
                owner : req.user.userId
            }
        );
        res.status(201).json(
            {
                message : "project created successfully" , project
            }
        )
    }
    catch(err)
    {
        next(err);
    }
};
async function getProjects(req , res , next )
{
    try
    {
        const {skill , page = 1 , limit = 10 } = req.query ;
        const filter = {};
        if(skill)
        {
            const matchedSkill = await Skill.findOne(   //skill document
                {
                    name : new RegExp("^" + skill + "$"  , i)
                }
            );
            if(!matchedSkill)
            {
                return res.json(
                    {
                        total : 0 ,
                        page : Number(page) ,
                        totalPages : 0 ,
                        projects : []
                    }
                );
            };
            filter.requiredSkills = matchedSkill._id ; // add property to filter
        };
        const pageNum = Math.max(parseInt(page) || 1 , 1 );
        const limitNum = Math.min(Math.max(parseInt(limit , 10) || 10 ,1) , 50 );
        const skip = (pageNum-1) * limitNum ;
        const [projects , total ] = await Promise.all([
         Project.find(filter).populate("owner" , "name").populate("requiredSkills").skip(skip).limit(limitNum) ,
         Project.countDocuments(filter) 

        ]);

        res.json(
            {
              total,
              page : pageNum ,
              totalPages : Math.ceil(total / limitNum) ,
              projects
            }
        ) ;
    }
    catch(err)
    {
        next(err);
    }
};
async function getRecommendedProjects(req , res , next)
{
    try
    {
        const profile = await Profile.findOne(
            {
                user : req.user.userId ,
            }
        );
        if(!profile)
        {
            return res.status(404).json({message : "profile is not found "});
        };
        const studentSkillIds = profile.skills.map((skillID) =>skillID.toString());
        const projects = await Project.find().populate("owner" , "name").populate("requiredSkills");
        const recommendedProjects = projects.map((project)=>
        {
            const requiredSkillIds = project.requiredSkills.map((skill)=> skill._id.toString());
            const matchedSkills = requiredSkillIds.filter((skillId)=>studentSkillIds.includes(skillId));
            const matchScore = requiredSkillIds.length === 0 ? 0 : (matchedSkills.length / requiredSkillIds.length) * 100;
            return {
                ...project.toObject() ,
                matchScore :
                Number(matchScore.toFixed(2))
            };
        });
        recommendedProjects.sort((a,b)=>b.matchScore - a.matchScore ) ;
        res.json({projects : "recommended projects"}) ;
    }
    catch(err)
    {
        next (err) ;
    }

}
async function getProjectById(req , res , next ) 
{
    try
    {
        const project = await Project.findById(req.params.id) .populate("owner" , "name").populate("requiredSkills");
        if(!project)
        {
            res.status(404).json({message :"project not found"}) ;
        }
        res.json({project});
    }
    catch(err)
    {
        next(err) ;
    }
    
}
async function updateProject(req , res , next)
{
    try
    {
        const {title , description , requiredSkills  , status} = req.body ;
        const project = await Project.findByIdAndUpdate( req.params.id ,
            {
                title ,
                description ,
                requiredSkills ,
                status
            },
            {
                new : true ,
                runValidators : true 
            }
        ). populate("owner" , "name") .populate("requiredSkills");
        if(!project)
        {
            return res.status(404).json({message : "project not found " }) ;
        }
        res.json({message : "project update successfully "})
    }
    catch(err)
    {
        next(err);
    }
};
async function deleteProject (req , res , next)
{
    try
    {
        const project = await Project.findAndDelete(req.params.id) ;
        if(!project)
        {
            res.status(404).json({message : "project not found "}) ;
        };
        res.json({message : "project deleted successfully"});
    }
    catch(err)
    {
        next(err)
    }
};
module.exports = 
{
    createProject ,
    getProjects ,
    getProjectById ,
    updateProject ,
    deleteProject ,
    getRecommendedProjects ,
}
