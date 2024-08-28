const FinancialReport = require('../models/FinancialReport');
const Paiement = require('../models/Paiment');
const moment = require('moment'); 

exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const adminId = req.user._id; 

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const payments = await Paiement.find({
      date: { $gte: start, $lte: end },
      isPaid: true,
    });

    const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const totalPayments = payments.length;

    const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
      const month = moment().month(i).format('MMMM');
      const total = payments
        .filter(payment => moment(payment.date).month() === i)
        .reduce((acc, payment) => acc + payment.amount, 0);
      return { month, total };
    });

    const report = new FinancialReport({
      reportType: 'custom',
      startDate: start,
      endDate: end,
      totalRevenue,
      totalPayments,
      revenueByMonth,
      school: adminId,
    });

    await report.save();

    res.status(201).json({ message: 'Report generated successfully.', report });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report.', error: error.message });
  }
};


exports.getReports = async (req, res) => {
    try {
      const adminId = req.user._id; 
  
      const reports = await FinancialReport.find({ school: adminId }).sort({ generatedAt: -1 });
  
      if (!reports.length) {
        return res.status(404).json({ message: 'No reports found for this school.' });
      }
  
      res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Error fetching reports.', error: error.message });
    }
  };
  