import {Product} from '../models'
import multer  from 'multer';
import path from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
import Joi from 'joi';
import fs from 'fs';
import productSchema from '../validators/productValidator';
import { error } from 'console';

const storage=multer.diskStorage({
   destination:(req,file,cb)=>cb(null,'uploads/'),
   filename:(req,file,cb)=>{
    const uniqueName=`${Date.now()}-${Math.random()*1e9}${path.extname(file.originalname)}`
    cb(null,uniqueName);
   }
});

const handelMultipart=multer({storage,limits:{fileSize:1e6*5}}).single('image');

const productController={
    async store(req,res,next){
        handelMultipart(req,res, async(err)=>{
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            const filePath=req.file.path;
            
            //validate
           
               
               const {error}=productSchema.validate(req.body);
               if(error){
                 fs.unlink(`${appRoot}/${filePath}`,(err)=>{
                    if(err)
                    return next(CustomErrorHandler.serverError(err.message));
                 });
                 return next(error);
               }
               const{name,price,size}=req.body;
               let document;
               try{
                  document= await Product.create({name,price,size,image:filePath});

               }catch(err){
                 return next(err);
               }
               res.status(201).json(document);
              
             
        });
        

    },
    async update(req,res,next){
      handelMultipart(req,res, async(err)=>{
        if(err){
            return next(CustomErrorHandler.serverError(err.message));
        }
        let filePath;
        if(req.file){
          filePath=req.file.path;
        }
        
        //validate
        const {error}=productSchema.validate(req.body);
        if(error){
          if(req.file){
            fs.unlink(`${appRoot}/${filePath}`,(err)=>{
              if(err)
              return next(CustomErrorHandler.serverError(err.message));
           });
          }
           return next(error);
        }
        const{name,price,size}=req.body;
        let document;
        try{
           document= await Product.findOneAndUpdate({_id:req.params.id},{
            name,
            price,
            size,
            ...(req.file && {image:filePath})
            },{new:true});
            

        }catch(err){
          return next(err);
        }
        res.status(201).json(document);
       
    });
  },
   async destroy(req,res,next){

    const document=await Product.findOneAndRemove({_id:req.params.id});
    if(!document){
      return next(new Error("Nothing to delete"));
    }
    //image delete
    const filePath=document._doc.image;
    fs.unlink(`${appRoot}/${filePath}`,(err)=>{
      if(err)
      return next(CustomErrorHandler.serverError(err.message));
   });
   res.json(document);

  },
  async index(req,res,next){
    //pagination :mongoose_pagination
    let document;
    try{
      document=await Product.find().select('-updatedAt -__v').sort({_id:-1});
      
    }catch(err){
       return next(CustomErrorHandler.serverError());
    }
    res.json(document);

  },
  async show(req,res,next){
     let document;
      try{
        document=await Product.findOne({_id:req.params.id}).select('-updatedAt -__v');
        if(!document){
          return next(new Error('product not found'));
        }
      }catch(err){
        return next(CustomErrorHandler.serverError());
      }
      res.json(document);
  }
}

export default productController;