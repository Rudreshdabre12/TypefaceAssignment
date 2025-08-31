import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const Signup = async (req, res) => {
    try {
        console.log(req.body);
        
        const { name, email, password } =await req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        newUser.save();
        return res.status(201).json({ message: "User created successfully" });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const Login = async (req, res) => {
    try {
        console.log(req.body);
        
        const { email, password } =await req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const tokenData = {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET || "default_secret_for_testing",{expiresIn:"1d"});
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:24*60*60*1000
        })
        return res.status(200).json({ message: "User logged in successfully", token, user });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
