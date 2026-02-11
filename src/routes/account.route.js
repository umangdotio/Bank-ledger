const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const  accountController = require("../controllers/account.controller")

/**
 *  - Create Account
 *  - POST /api/account
 *  - Protected Route
 *  - Request Body: { currency: String (optional, default: "INR") }
 *  - Response: { message: String, status: String, account: Object }
 */
router.post("/accounts", authMiddleware.authMiddleware, accountController.createAccountController)



module.exports = router