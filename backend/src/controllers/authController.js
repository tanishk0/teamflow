import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../db/User";


export async function signup(req, res) {
    //signup logic
    const { name , email , password } = req.body;
    
}