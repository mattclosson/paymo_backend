require("dotenv").config(); // Load ENV Variables
const stripe = require('stripe')(process.env.secretKey);
const request = require('request');
const querystring = require('querystring');
const express = require('express');
const router = express.Router();
const User = require("../models/user");
const { verifyToken } = require("./authenticate");

router.get('/authorize', (req, res) => {
    let parameters = {
        client_id: process.env.clientId,
      };
    parameters = Object.assign(parameters, {
        redirect_uri: process.env.publicDomain + '/user/stripe/token',
        'stripe_user[business_type]': req.user.type || 'individual',
        'stripe_user[business_name]': req.user.businessName || undefined,
        'stripe_user[first_name]': req.user.firstName || undefined,
        'stripe_user[last_name]': req.user.lastName || undefined,
        'stripe_user[email]': req.user.email || undefined,
        'stripe_user[country]': req.user.country || undefined
    });
    res.send('working')
})

router.post('/token', async (req, res) => {
    const body = req.body
    res.status(200).json(body)
    try {
      // Post the authorization code to Stripe to complete the Express onboarding flow
      const expressAuthorized = await request.post({
        uri: process.env.tokenUri, 
        form: { 
          grant_type: 'authorization_code',
          client_id: process.env.clientId,
          client_secret: process.env.secretKey,
          code: req.query.code
        },
        json: true
      });
  
      if (expressAuthorized.error) {
        throw(expressAuthorized.error);
      }
  
      // Update the model and store the Stripe account ID in the datastore:
      // this Stripe account ID will be used to issue payouts to the pilot
      console.log(req.query.email)
      const email = req.query.email
      const user = User.findOne({email})
      if(user.stripeAccountId) {
          res.status(401).json({"error": "Stripe account already made"})
      }
    //   user.stripeAccountId = expressAuthorized.stripe_user_id;

      await user.save();

      console.log(user)
  
      res.json({user})
    } catch (err) {
      res.status(401).json(err)
    }
})

router.get('/token', async (req, res, next) => {
    try {
      // Post the authorization code to Stripe to complete the Express onboarding flow
      const expressAuthorized = await request.post({
        uri: process.env.tokenUri, 
        form: { 
          grant_type: 'authorization_code',
          client_id: process.env.clientId,
          client_secret: process.env.secretKey,
          code: req.query.code
        },
        json: true
      });
  
      if (expressAuthorized.error) {
        throw(expressAuthorized.error);
      }
      console.log(expressAuthorized)
      res.status(200).send({expressAuthorized}) 
    } catch (err) {
      res.status(401).json(err)
    }
  });

module.exports = router
