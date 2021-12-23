const mongoose = require("./connection");
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');


// const Session = new Schema({
//   refreshToken: {
//     type: String,
//     default: "",
//   },
// })

const InvoiceSchema = new Schema({
    billTo: String,
    products: [{
        description: String,
        qty: Number,
        unitPrice: Number,
        amount: Number
    }],
    totalPrice: [Number], 
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

const Invoice = model("Invoice", InvoiceSchema);


module.exports = Invoice;