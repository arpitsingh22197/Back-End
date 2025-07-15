class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = null; // Assuming data is not provided in this context
        this.error = error;
        
        this.success = false;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);

        }
    }
}
export {ApiError}