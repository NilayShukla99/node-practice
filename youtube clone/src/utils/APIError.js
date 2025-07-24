class APIError extends Error {

    constructor (
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stackTrace = ''
    ) {
        super(message) // calling parent class constructor

        this.statusCode = statusCode;
        this.errors = errors;
        // this.data = null;
        this.success = false;
        
        if (stackTrace) {
            this.stackTrace = stackTrace;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }

}

export default APIError;