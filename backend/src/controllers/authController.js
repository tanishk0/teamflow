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
        res.status(201).json({
            message: "Account created successfully"
        })
    }
    catch(error){
        console.log(error)
        res.status(400).json({
            message: "Error while saving the user",
        })
    }
}