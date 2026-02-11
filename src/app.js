require("dotenv").config()
const express = require("express")
const cookieParser= require("cookie-parser")
const connectDB = require("./db/db")

connectDB()
const app = express()
app.use(express.json())
app.use(cookieParser())

/**
 * - Routes required
 */
const authRoutes = require("./routes/auth.route")
const accountRoutes = require("./routes/account.route")

/**
 * - Use Routes
 */
app.use("/api/auth",authRoutes)
app.use("/api/transaction", accountRoutes)




module.exports= app