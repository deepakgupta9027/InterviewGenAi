const userModel = require('../models/user.model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require('../models/blacklist.model');



async function registerUserController(req,res){
    const {username,email,password} = req.body;
    if(!username || !email || !password){
        return res.status(400).json({
            message:"please provide username, email and password"
        })
    }


    const isUserAlreadyExists = await userModel.findOne({
        $or:[{username},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"user already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await userModel.create({
        username,
        email,
        password:hashedPassword
    })

    const token = jwt.sign(
        {id:user._id, username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
    });

    res.status(201).json({
        message:"user registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function loginUserController(req,res){
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            message:"please provide email and password"
        })
    }
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(400).json({
            message:"user not found"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({
            message:"invalid password"
        })
    }

    const token = jwt.sign(
    {id:user._id, username:user.username},
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
    });

    return res.status(200).json({
        message:"user logged in successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function logoutUserController(req, res){
    const token = req.cookies.token;

    if(token){
        await tokenBlacklistModel.create({token});
    }

    res.clearCookie("token");

    res.status(200).json({
        message:"user logged out successfully"
    }) 
}

async function getMeController(req, res){
    const user = await userModel.findById(req.user.id);

    return res.status(200).json({
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
}