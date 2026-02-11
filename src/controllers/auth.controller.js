const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email")

/** 
 * - user Register Controller
 * - Post api/auth/signUp
 */
async function userRegisterController(req, res) {

    const { email, username, password } = req.body
    const isExists = await userModel.findOne({
        email: email
    })

    if (isExists) {

        return res.status(422).json({
            message: "Email already exists",
            status: failed
        })

    }

    const user = await userModel.create({
        email,
        password,
        username
    })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
    res.cookie("token", token)

    res.status(201).json({
        message: "User created successfully",
        user: {
            _id: user._id,
            email: user.email,
            name: user.username,
        },
        token
    })
    await emailService.sendRegistrationEmail(user.email, user.username)
    

}

/** 
* - user Login Controller
* - Post api/auth/signIn
*/
async function userLoginController(req, res) {
    const { username, email, password, } = req.body;

    const user = await userModel.findOne({
        email
    }).select("+password");

    if (!user) {
        return res.status(401).json({
            message: "Email is Inavlid",
        });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: " wrong password",
        });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            _id: user._id,
            email: user.email,
            name: user.username,
        },
        token
    })

}


module.exports = { userRegisterController, userLoginController }