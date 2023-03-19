class CustomErrorHandler extends Error{
    constructor(status , msg){
       super();
        this.status=status;
        this.msg=msg;
    }

    static alreadyExist(msg){
        return new CustomErrorHandler(409,msg);
    }
    static wrongCredentials(msg){
        
        return new CustomErrorHandler(401,msg);
    }
    static unAuthorization(msg='unAuthorization'){
        
        return new CustomErrorHandler(401,msg);
    }
    static notFound(msg='404 user not found'){
        
        return new CustomErrorHandler(401,msg);
    }
    static serverError(msg='Internal server error'){
        
        return new CustomErrorHandler(500,msg);
    }    
    
}

export default CustomErrorHandler;