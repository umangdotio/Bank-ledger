const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "From Account is required"],
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "To Account is required"],
        index: true,
    },
    amount: {
        type: Number,   
        required: [ true, "Amount is required"], 
        min: [0, "Amount must be a positive number"]
    },
    status: {
        type: String,
        enum: {
            values: ["Pending", "Completed", "Failed", "Reversed"],
            message: "Status must be either Pending, Completed, Failed or Reversed"
        },
        default: "Pending",
         index: true,
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency Key is required for transaction"],
        unique: true,
        index: true,
    },
    description: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,     
        default: Date.now
    }
},{
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel