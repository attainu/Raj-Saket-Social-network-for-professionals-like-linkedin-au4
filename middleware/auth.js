const jwt = require('jsonwebtoken');


module.exports = function(req,res,next) {

    const token = req.header('x-auth-token');                   //Getting token from header
    
    if(!token) {                                                //checking if ther is no token
        return res.status(401)
        .json({ msg: 'No token, authorization denied' });
    }
   
    //verifying token
    try
        {
          const decoded = jwt.verify(token,'mysecrettoekn'); 
          req.user = decoded.user;
          next();
        } 

        catch(err)                                          //if there is token but not valid then it will give the error
        {
            return res.status(401).json({msg:'Token is not valid'})
        }
};  