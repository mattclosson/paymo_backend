# Paymo 

Paymo is a personal project to learn the Stripe Connect API. It is unfinished, but it's capable of creating marketplace accounts, allowing users to create invoices, and the ability for customers to pay those invoices. 

To get the frontend of this app, go to this repo: https://github.com/mattclosson/paymo_frontend

## How to run

You MUST have a Stripe account to run this application. Make sure to run your Stripe account in test mode. You can verify this by checking for `_test_ `in your API keys.

Clone this repo and cd into the folder

Run `npm install` to install the dependencies 

Create an .env file and add the following variables:

- DATABASE_URL: your uri link to your mongo database
- PORT: port your local server runs on (default is 4000)
- SECRET: secret for cookies (can be anything)
- JWT_SECRET: secret for JWT (can be anything)
- REFRESH_TOKEN_SECRET: secret for refresh token (can be anything)
- SESSION_EXPIRY = 60 * 15
- REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 30

Add the Stripe API variables to your .env file:
- publishableKey
- secretKey
- clientId
- authorizeUri
- tokenUri
- publicDomain: the domain Stripe routes back to 

In your terminal, run `npm run dev` to start the server