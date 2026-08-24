import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../db/User";


export async function signup(req, res) {
    //signup logic
    const { name , email , password } = req.body;
    try {
        const alreadyUser = await User.findOne({ email })
        if(alreadyUser){
            return res.status(409).json({
                message: "User with this email already exists."
            });
        }
        
        const hash_password = await bcrypt.hash(password, 10);
        const user = new User({
            name: name,
            email: email,
            password: hash_password,
        })
        const savedUser = await user.save();
        const token = jwt.sign(
            {userId: savedUser._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({
            message: "Account created successfully"
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            message: "Error while saving the user",
        })
    }
}