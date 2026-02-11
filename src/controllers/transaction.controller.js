const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * - Some Steps for Transaction Process:
 * 1. Validate Request
 * 2. Validate Idempotency Key
 * 3. Check Account Status
 * 4. Derive sender balance from Ledger
 * 5. Create Transaction Record(Pending Status)
 * 6. Update Sender Balance in Ledger
 * 7. Update Receiver Balance in Ledger
 * 8. Create Debit Entry in Ledger for Sender
 * 9. Create Credit Entry in Ledger for Receiver
 * 10. Mark Transaction as Completed
 * 11. Commit MongoDB Session
 * 12. Send Email Notifications
 */
async function createTransactionController(req, res) {
    /**
     * 1. Validate Request
     */

    const { fromAccount, toAccount, amount, idempotencyKey, description } =
        req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields",
        });
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: "Account not found",
        });
    }

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        description,
    });
    res.status(201).json({
        message: "Transaction created successfully",
        transaction,
    });

    /**
     * 2. Validate Idempotency Key
     */

    const existingTransaction = await transactionModel.findOne({
        idempotencyKey: idempotencyKey,
    });
    if (existingTransaction) {
        if (existingTransaction.status === "Completed") {
            return res.status(200).json({
                message: "Transaction already completed",
                transaction: existingTransaction,
            });
        }
        if (existingTransaction.status === "Pending") {
            return res.status(200).json({
                message: "Transaction is still pending",
            });
        }
        if (existingTransaction.status === "Failed") {
            return res.status(500).json({
                message: "Transaction failed previously. Please try again.",
            });
        }
        if (existingTransaction.status === "Reversed") {
            return res.status(500).json({
                message: "Transaction was reversed, please try again.",
            });
    }
}

/**
 *  3. Check Account Status
 */
  
if(fromUserAccount.status !== "Active" || toUserAccount.status !== "Active") {
    await transactionModel.findByIdAndUpdate(transaction._id, {
        status: "Failed",
    });
    return res.status(400).json({
        message: "One or both accounts are not active",
    });
}

/**
 * 4. Derive sender balance from Ledger(Check if sender has sufficient balance)
 */

const balance = await fromUserAccount.getBalance();
if (balance < amount) {
    await transactionModel.findByIdAndUpdate(transaction._id, {
        status: "Failed",
    });
    return res.status(400).json({
        message: "Insufficient balance in sender's account",
    });
}

/**
 * 5. Create Transaction Record(Pending Status)
 */

const session = await mongoose.startSession();
session.startTransaction();


}

module.exports = {
    createTransactionController,
}
