import { Request, Response } from "express";

const registration = async(req:Request, res:Response) => {
    const {fullName, email,password, confirmPassword, terms} = req.body;
    if(!fullName || !email || !password || !confirmPassword || !terms){
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields",
        })
    }
    if(password !== confirmPassword){
         return res.status(400).json({
            success: false,
            message: "Passwords do not match",
        })
    }
``

    res.json({
        success: true,
        message: "Registration successful",
        
    })
}

export {
    registration
}