const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  isPaid: { type: Boolean, default: false },
  facturePath: { type: String },
});

const Paiement = mongoose.model("Paiement", paiementSchema);

module.exports = Paiement;
