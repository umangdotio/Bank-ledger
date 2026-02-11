const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")

/**
 *  - Create Transaction
 *  - POST /api/transaction/create
 *  - Protected Route
 *  - Request Body: { fromAccount: String, toAccount: String, amount: Number, idempotencyKey: String, description: String (optional) }
 *  - Response: { message: String, transaction: Object }
 */
router.post("/create", authMiddleware.authMiddleware, transactionController.createTransactionController)