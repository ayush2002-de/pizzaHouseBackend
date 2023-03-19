import Joi from 'joi';
import { REFRESH_SECRET } from '../../config';
import { User } from '../../models';
import RefreshToken from '../../models/refreshToken';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtServices from '../../services/JwtServices';

const refreshController={
    async refresh(req,res,next){
        const refreshSchema=new Joi.object({
            refresh_token:Joi.string().required()
        });

        const {error}=refreshSchema.validate(req.body);
        if(error) return next(error);
        

        let refreshToken;
        try{

            refreshToken=await RefreshToken.findOne({token:req.body.refresh_token});
        
            if(!refreshToken)return next(CustomErrorHandler.unAuthorization("Invalid refresh token"));
            

            let userId;
            try{
                const {_id}=  JwtServices.verify(refreshToken.token,REFRESH_SECRET);
                userId=_id;
            }catch(err){
                return next(CustomErrorHandler.unAuthorization("Invalid refresh token"));
            }

            const user=await User.findOne({_id:userId});
            if(!user)return next(CustomErrorHandler.notFound("user not found"));

            //token
            const access_token =JwtServices.sign({_id:user._id,role:user.role});
            const refresh_token=JwtServices.sign({_id:user._id,role:user.role},'1y',REFRESH_SECRET);

            //refreshToken whitelist
            await RefreshToken.create({token:refreshToken});

            res.json({access_token,refresh_token});


        }catch(error){
            return next(new Error("something went wrong"+error.message));
        }
    }
}
export default refreshController;