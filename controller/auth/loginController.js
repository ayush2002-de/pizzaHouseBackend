import Joi from "joi";
import {RefreshToken,User} from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcrypt"
import JwtServices from "../../services/JwtServices";
import {REFRESH_SECRET} from "../../config"


const loginController={
    async login (req,res,next){
        //validate
        const loginSchema=new Joi.object({
            email:Joi.string().email().required(),
             password:Joi.string().pattern(new RegExp('[a-zA-Z0-9]{3,30}')).required()
        });

        const {error}=loginSchema.validate(req.body);
        if(error) return next(error);

        try{
            const user=await User.findOne({email:req.body.email});
           
            if(user==null)return next(CustomErrorHandler.wrongCredentials("email is not register"));
        
            //compare password

            const match =await bcrypt.compare(req.body.password,user.password);
            if(!match)return next(CustomErrorHandler.wrongCredentials("wrong password"));

            //token
            const access_token =JwtServices.sign({_id:user._id,role:user.role});
            const refresh_token=JwtServices.sign({_id:user._id,role:user.role},'1y',REFRESH_SECRET);

            //refreshToken whitelist
            await RefreshToken.create({token:refresh_token});

            res.json({access_token,refresh_token});


        }catch(err){
           return next(err);
        }

    },
    async logout(req,res,next){

        const refreshSchema=new Joi.object({
            refresh_token:Joi.string().required()
        });

        const {error}=refreshSchema.validate(req.body);
        if(error) return next(error);

        try {
            await RefreshToken.deleteOne({token:req.body.refresh_token});
            res.json({status:"logout sucessfully"});
            
        } catch (error) {
           return next(new Error("something went wrong in database "+error.message)); 
        }
    }
}
export default loginController;