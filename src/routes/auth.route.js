const express = require("express")
const authController = require("../controllers/auth.controller")

const router = express.Router()

/* post /api/auth/signUp */
router.post("/signUp",authController.userRegisterController)

/* post /api/auth/signIn */
router.post("/signIn",authController.userLoginController)




module.exports = router