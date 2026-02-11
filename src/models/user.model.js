// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// const validator = require("validator");

// const MAX_LOGIN_ATTEMPTS = 5;
// const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// const userSchema = new mongoose.Schema(
//   {
//     /* ============================
//        IDENTIFIERS
//     ============================ */

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: validator.isEmail,
//         message: "Invalid email address",
//       },
//     },

//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//       trim: true,
//       minlength: 6,
//       maxlength: 32,
//       match: /^[a-zA-Z0-9_]+$/,
//     },

//     /* ============================
//        AUTH
//     ============================ */

//     passwordHash: {
//       type: String,
//       required: true,
//       select: false,
//     },

//     passwordChangedAt: {
//       type: Date,
//     },

//     /* ============================
//        SECURITY & STATE
//     ============================ */

//     status: {
//       type: String,
//       enum: ["ACTIVE", "LOCKED", "SUSPENDED", "CLOSED"],
//       default: "ACTIVE",
//       index: true,
//     },

//     failedLoginAttempts: {
//       type: Number,
//       default: 0,
//     },

//     lockUntil: {
//       type: Date,
//     },

//     /* ============================
//        VERIFICATION & RECOVERY
//     ============================ */

//     emailVerified: {
//       type: Boolean,
//       default: false,
//     },

//     passwordResetTokenHash: {
//       type: String,
//       select: false,
//     },

//     passwordResetExpiresAt: {
//       type: Date,
//     },

//     /* ============================
//        AUDIT
//     ============================ */

//     lastLoginAt: {
//       type: Date,
//     },

//     lastLoginIP: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// /* ============================
//    INDEXES (EXPLICIT)
// ============================ */

// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ username: 1 }, { unique: true });
// userSchema.index({ status: 1 });

// /* ============================
//    PASSWORD HASHING
// ============================ */

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("passwordHash")) return

//   this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
//   this.passwordChangedAt = new Date();
//  
// });

// /* ============================
//    AUTH METHODS
// ============================ */

// userSchema.methods.comparePassword = function (candidatePassword) {
//   if (!candidatePassword) return false;
//   return bcrypt.compare(candidatePassword, this.passwordHash);
// };

// userSchema.methods.isLocked = function () {
//   return this.lockUntil && this.lockUntil > Date.now();
// };

// userSchema.methods.registerFailedLogin = function () {
//   this.failedLoginAttempts += 1;

//   if (this.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
//     this.lockUntil = new Date(Date.now() + LOCK_TIME);
//     this.status = "LOCKED";
//   }

//   return this.save();
// };

// userSchema.methods.registerSuccessfulLogin = function (ip) {
//   this.failedLoginAttempts = 0;
//   this.lockUntil = undefined;
//   this.status = "ACTIVE";
//   this.lastLoginAt = new Date();
//   this.lastLoginIP = ip;

//   return this.save();
// };

// /* ============================
//    PASSWORD RESET
// ============================ */

// userSchema.methods.createPasswordResetToken = function () {
//   const rawToken = crypto.randomBytes(32).toString("hex");

//   this.passwordResetTokenHash = crypto
//     .createHash("sha256")
//     .update(rawToken)
//     .digest("hex");

//   this.passwordResetExpiresAt = Date.now() + 15 * 60 * 1000;

//   return rawToken;
// };

// const User = mongoose.model("User", userSchema);
// module.exports = User;


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required for creating a user"],
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Invalid Email Address",
            ],
            unique: [true, "Email already exists"],
        },
      username: {
            type: String,
            required: [true, "Name is required for creating an account"],
            minlength: 1,
            trim: true,
            // unique: [true, "Email already exists"],
        },
        password: {
            type: String,
            required: [true, "Password is required for creating an account"],
            minlength: [6, "Password should contain more than 6 characters"],
            select: false,
            maxlength: 128,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return
    } else {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        return
    }
});

userSchema.methods.comparePassword = async function (password) {
    console.log(password, this.password)
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel
