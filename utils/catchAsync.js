//Module to handle Async Error
//Passes the error into next error handler middleware
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}