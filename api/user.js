const express = require("express")
const router = express.Router()
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs');

const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser, verifyToken } = require("./authenticate");
const { request } = require("express");

router.post("/signup", async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      console.log(req.body)
  
      if (!(email && password && firstName && lastName)) {
        return res.status(401).send({error: "All input is required"});
      }
  
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).json({error: "User Already Exist. Please Login"});
      }
  
      encryptedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(), 
        password: encryptedPassword,
      });
  
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
  
      res.status(201).json({user, token});
    } catch (err) {
        console.log(err)
    }
  })


router.post("/login", async (req, res, next) => {
    try {
        const {email, password} = req.body;
        console.log(req.body)
        if(!(email && password)) {
            res.status(401).send({error: "All input is required"})
        }

        const user = await User.findOne({ email })

        console.log(user)

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                {user_id: user._id, email},
                process.env.JWT_SECRET,
                {
                    expiresIn: "30d"
                }
            )

            user.token = token

            res.status(200).json({user: user, token: token})
        }
        res.status(401).send({error:"Invalid Credentials"})
    } catch(err) {
        console.log(err)
    }
})

router.get("/me", verifyToken, async (req, res, next) => {
    try {
        const {email} = req.user
        console.log(req.user)
        const user = await User.findOne({email})
        res.status(200).send(user)
    } catch(err) {
        res.status(401).send("error")
    }
})

router.put("/update", verifyToken, async (req, res) => {
    try {
        const {email} = req.user
        const stripe_user_id = req.body.stripe_user_id
        const user = await User.findOne({email})
        user.stripeAccountId = stripe_user_id
        console.log(stripe_user_id)
        await user.save()
        res.status(200).send(user)
    } catch(err) {
        res.status(401).send("error")
    }
})

// router.get("/logout", verifyUser, (req, res, next) => {
//     const { signedCookies = {} } = req
//     User.findById(req.user._id).then(
//       user => {
//         const tokenIndex = user.refreshToken.findIndex(
//           item => item.refreshToken === refreshToken
//         )
  
//         if (tokenIndex !== -1) {
//           user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
//         }
  
//         user.save((err, user) => {
//           if (err) {
//             res.statusCode = 500
//             res.send(err)
//           } else {
//             res.send({ success: true })
//           }
//         })
//       },
//       err => next(err)
//     )
//   })
module.exports = router