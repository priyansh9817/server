import express from "express";
import {registerController,loginController,testController, forgotPasswordController,} from "../controllers/authcontroller.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);
// privates Routes

router.get("/userauth", requireSignIn,(req,res)=>{
    res.status(200).send({ok: true});
});

// Forgot password || post
router.post('/forgotpassword', forgotPasswordController)
export default router;
