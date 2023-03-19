 import Joi from 'joi';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {User,RefreshToken} from '../../models';
import bcrypt from 'bcrypt';
import JwtServices from '../../services/JwtServices';
import { REFRESH_SECRET } from '../../config';


 const registerController ={
    async register(req,res,next){

       //validate
       const registerSchema=Joi.object({

        name:Joi.string().min(3).max(30).required(),
        email:Joi.string().email().required(),
        password:Joi.string().pattern(new RegExp('[a-zA-Z0-9]{3,30}')).required(),
        repeat_password:Joi.ref('password')

       });
       
       const {error}=registerSchema.validate(req.body);
       if(error){
        return next(error);
       }

       
       // validate the user
       try {
         const exist=await User.exists({email:req.body.email});
         if(exist)return next(CustomErrorHandler.alreadyExist("this email is already taken"));
       } catch (error) {
         return next(error);
       }
       const {name,email,password}=req.body;
       
       //hashed password
       const hashedPassword=await bcrypt.hash(password,10);

       //save data in database
       const user=new User({
        name,
        email,
        password :hashedPassword
       })

       let acess_token;
       let refresh_token;
       try{
           const result =await user.save();

           acess_token=JwtServices.sign({_id:result._id,role:result.role});
           refresh_token=JwtServices.sign({_id:result._id,role:result.role},'1y',REFRESH_SECRET);

           //refreshToken whitelist
           await RefreshToken.create({token:refresh_token});

       }catch(err){
        return next(err)
       }

       
       res.json({acess_token,refresh_token});
      

    }
 }
 export default registerController;