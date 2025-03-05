import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helper/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, question} = req.body;
    //validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!question) {
      return res.send({ message: "Answer is Required" });
    }
    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: true,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      question
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password req' });
    }
    //check user
     // Find the user by aadharCardNumber
     const user = await userModel.findOne({email});

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};
// Forgot password

export const forgotPasswordController =async(req, res) =>{
  try{
    const {email,question, newpassword} = req.body
    if(!email){
      res.status(400).send({message:"Email is required"})
    }
    if(!question){
      res.status(400).send({message:"question is required"})
    }
    if(!newpassword){
      res.status(400).send({message:"New-Password is required"})
    }
    //check
    const user = await userModel.findOne({email,question})
    // valdiation 
    if(!user){
      return res.status(404).send({
        success:false,
        message:"Wrong Email and answer "
      })
    }
    // after setting the new password we have to hashed the password 
    const hashed = await hashPassword (newpassword)
    await userModel.findByIdAndUpdate(user._id,{password:hashed});
    res.status(200).send({
      success:true,
      message:"Password reset Successfully",
    })
  } catch(error){
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
}

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};