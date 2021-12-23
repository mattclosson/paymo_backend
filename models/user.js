const mongoose = require("./connection");
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  type: {
    type: String,
    default: 'individual',
    enum: ['individual', 'company']
  },
  email: {
    type: String,
    unique: [true, "email already exists in database!"],
    lowercase: true,
    trim: true,
    required: [true, "email not provided"],
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: '{VALUE} is not a valid email!'
    }

  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  address: String,
  postalCode: String,
  city: String,
  state: { type: String}, 
  country: { type: String, default: 'US' },
  created: { type: Date, default: Date.now },
  businessName: String,
  // Stripe account ID to send payments obtained with Stripe Connect.
  stripeAccountId: String,
  token: String,
  invoices: [{
    type: Schema.Types.ObjectId,
    ref: "Invoice"
  }]
});

const User = model("User", UserSchema);


module.exports = User;