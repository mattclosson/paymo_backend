const express = require("express");
const { restart } = require("nodemon");
const router = express.Router()
const Invoice = require("../models/invoice");
const User = require("../models/user")
const stripe = require('stripe')(process.env.secretKey);

const { verifyToken } = require("./authenticate");

router.get("/", async (req,res) => {
    const invoices = await Invoice.find({})
    res.status(200).json(invoices)
})
router.post("/", async (req, res) => {
    try {
        const {name, email, products, totalPrice, userId} = req.body

        const user = await User.findById({_id: userId})

        const invoice = new Invoice({
            name,
            email,
            products, 
            totalPrice,
            user
        })
        await invoice.save()

        user.invoices.push(invoice)
        await user.save()

        res.status(200).json({success: true, data: invoice})
    } catch (err) {
        res.status(401).send(err)
    }
})

router.get("/stripeaccount", async (req, res) => {
    const account = await stripe.accounts.retrieve(
        "acct_1K9bDjQK6IQKcjBK"
    );
    // const customer = await stripe.customers.create({
    //   email: 'larrynewemail@example.com',
    //   name: "Larry"
    // }, {
    //     stripeAccount: "acct_1K9bDjQK6IQKcjBK"
    // });

    const invoiceItem = await stripe.invoiceItems.create({
        customer: 'cus_KpGAkXce8CeUMA',
        currency: 'usd',
        unit_amount: 5000,
        quantity: 40
    }, {
        stripeAccount: "acct_1K9bDjQK6IQKcjBK"
    });

    // console.log(customer)
    const invoice = await stripe.invoices.create({
        customer: "cus_KpGAkXce8CeUMA",
        collection_method: "send_invoice",
        days_until_due: 30
    }, {
        stripeAccount: "acct_1K9bDjQK6IQKcjBK"
    });
    // const invoice = await stripe.invoices.retrieve(
    //     'in_1K9bduQK6IQKcjBKOBLetAjR'
    // );

    // console.log(invoice.id)
    // const finalInvoice = await stripe.invoices.finalizeInvoice(
    //     invoice.id
    // );

    // console.log(finalInvoice)
    res.json(invoice)
})

router.post("/new", async (req,res) => {
    const {name, email, totalPrice, products, userId} = req.body
    const user = await User.findById({_id: userId})

    const customer = await stripe.customers.create({
        email,
        name
    }, {
        stripeAccount: user.stripeAccountId
    })
    for(let i = 0; i < products.length; i++) {
        const unit_amount = products[i].unitPrice * 100
        const quantity = products[i].qty
        const description = products[i].description
        const invoiceItem = await stripe.invoiceItems.create({
            customer: customer.id,
            currency: 'usd',
            unit_amount,
            quantity,
            description
        }, {
            stripeAccount: user.stripeAccountId
        })
    }

    const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: "send_invoice",
        days_until_due: 30
    }, {
        stripeAccount: user.stripeAccountId
    })

    res.json(invoice)
})

router.post("/finalize", async (req, res) => {
    const {invoiceId} = req.body

    const finalize = await stripe.invoices.sendInvoice(
        "in_1K9hlTQK6IQKcjBKu7eYgof3"
    )

    res.json(finalize)
})

router.get("/stripe", verifyToken, async (req, res) => {
    const {user_id} = req.user
    const id = user_id
    const user = await User.findById(id)

    stripeAccountId = user.stripeAccountId

    const invoices = await stripe.invoices.list({
        
    }, {
        stripeAccount: stripeAccountId
    });

    res.json(invoices)
})

router.get("/stripe/paid", verifyToken, async (req, res) => {
    const {user_id} = req.user
    const id = user_id
    const user = await User.findById(id)

    stripeAccountId = user.stripeAccountId

    const invoices = await stripe.invoices.list({
        status: "paid"
    }, {
        stripeAccount: stripeAccountId
    });

    res.json(invoices)
})

router.get("/stripe/open", verifyToken, async (req, res) => {
    const {user_id} = req.user
    const id = user_id
    const user = await User.findById(id)

    stripeAccountId = user.stripeAccountId

    const invoices = await stripe.invoices.list({
        status: "open" || "draft"
    }, {
        stripeAccount: stripeAccountId
    });

    res.json(invoices)
})

router.get("/users", verifyToken, async (req, res) => {
    // const userId = req.params.id
    const {user_id} = req.user
    const id = user_id
    let allInvoices = await User.findById(id).populate("invoices")
    res.status(200).json(allInvoices.invoices)
})

router.get("/:id", verifyToken, async (req,res) => {
    const id = req.params.id
    const {user_id} = req.user
    const user = await User.findById({_id: user_id}).populate("invoices")
    const stripeAccount = user.stripeAccountId
    const invoice = await stripe.invoices.retrieve(id, { stripeAccount });
    console.log(invoice)
    res.status(200).json(invoice)
})


router.delete("/:id", async (req, res) => {
    const id = req.params.id
    console.log(id)
    const invoice = await Invoice.findById(id)
    console.log(invoice)
    const deletedInvoice = await Invoice.findByIdAndRemove(id)
    // const deletedFromUser = await User.findByIdAndRemove(user)
    res.json(deletedInvoice)
})

router.get("/send/:id", verifyToken, async (req, res) => {
    const id = req.params.id
    const {user_id} = req.user
    const user = await User.findById({_id:user_id})

    stripeAccountId = user.stripeAccountId

    const invoice = await stripe.invoices.sendInvoice(
        id, {
        stripeAccount: stripeAccountId
    });

    res.json(invoice)
})

module.exports = router