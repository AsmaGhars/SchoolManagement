const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const financialReportSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalRevenue: {
    type: Number,
    required: true,
  },
  totalPayments: {
    type: Number,
    required: true,
  },
  revenueByMonth: [
    {
      month: {
        type: String,
        enum: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
      },
      total: {
        type: Number,
      }
    }
  ],
  school: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  additionalData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },

  generatedAt: {
    type: Date,
    default: Date.now,
  }
});

const FinancialReport = mongoose.model("FinancialReport", financialReportSchema);

module.exports = FinancialReport;
