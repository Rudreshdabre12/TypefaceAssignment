import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    transactions:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Transaction"
        }
    ]
});

const User = mongoose.model("User", UserSchema);
export default User;
