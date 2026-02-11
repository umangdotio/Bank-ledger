const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: {
                values: ["ACTIVE", "SUSPENDED", "CLOSED"],
                message: "Status must be either ACTIVE, SUSPENDED, or CLOSED",
            },
            default: "ACTIVE",
            index: true,
        },
        currency: {
            type: String,
            default: "INR",
            required: [true, "Currency is required"],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
    const accountId = this._id;
    const debitEntries = await ledgerModel.aggregate([
        { $match: { account: accountId, type: "DEBIT" } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
                    },
                },
                totalCredit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
                    },
                },
            },
        },
        { $project: { _id: 0, balance: { $subtract: ["$totalCredit", "$totalDebit"] } } },
    ]);
    if (debitEntries.length === 0) {
        return 0;
    }
    return debitEntries[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
