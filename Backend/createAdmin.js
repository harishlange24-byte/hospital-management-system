import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";

dotenv.config();

const createAdmin = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");

        const existingAdmin = await User.findOne({
            email : "admin@test.com",
        });

        if(existingAdmin){
            console.log("Admin already exist");
            process.exit(0);
        }

        const hashedPassword  = await bcrypt.hash("Admin@123",10);

        const admin = await User.create({
            name:"Hospital Admin",
            email:"admin@test.com",
            password:hashedPassword,
            role:"admin",
            phone:"9999999999",
        });

        console.log("Admin Created Successfully");
        console.log({
            id : admin._id,
            name:admin.name,
            email:admin.email,
            role:admin.role,
        });
        process.exit(0);


    }catch(err){
        console.err("Error creating admin : ",err);
        process.exit(1);
    }
};
createAdmin();