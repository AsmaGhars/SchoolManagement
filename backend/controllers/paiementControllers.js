const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Paiement = require('../models/Paiment');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Inscription = require('../models/Inscription');
const Admin = require('../models/Admin');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

exports.createPaiement = async (req, res) => {
  try {
    const userId = req.user._id;
    const student = await Student.findById(userId);

    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé.' });
    }

    const admin = await Admin.findById(student.school);

    if (!admin) {
      return res.status(404).json({ message: 'École non trouvée.' });
    }

    const amount = admin.fees * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { studentId: userId.toString() }
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: 'Intent de paiement créé avec succès.',
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de l\'intent de paiement.',
      error: error.message,
    });
  }
};

exports.confirmPaiement = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const studentId = paymentIntent.metadata.studentId;

      const paiement = new Paiement({
        studentId: studentId,
        amount: paymentIntent.amount / 100,
        isPaid: true,
      });

      await paiement.save();

      const downloadsFolder = path.join(os.homedir(), 'Downloads');
      const doc = new PDFDocument();
      const facturePath = path.join(downloadsFolder, `facture_${paiement._id}.pdf`);
      doc.pipe(fs.createWriteStream(facturePath));

      doc.fontSize(16).text('Facture de Paiement', { align: 'center' });
      doc.text(`ID de Paiement: ${paiement._id}`);
      doc.text(`Étudiant ID: ${paiement.studentId}`);
      doc.text(`Montant: ${paiement.amount}€`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.end();

      paiement.facturePath = facturePath;
      await paiement.save();

      await Student.findByIdAndUpdate(studentId, { isActive: true });

      const parent = await Parent.findOne({ children: studentId });
      if (parent) {
        await Parent.findByIdAndUpdate(parent._id, { isActive: true });
      }

      const inscription = await Inscription.findOne({ student: studentId });
      if (inscription) {
        inscription.isPaid = true;
        await inscription.save();
      }

      res.status(200).json({ message: 'Paiement confirmé avec succès.', paiement });
    } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
      res.status(400).json({ message: 'Le paiement nécessite une action supplémentaire.' });
    } else {
      res.status(400).json({ message: 'Le paiement n\'a pas été complété avec succès.', status: paymentIntent.status });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la confirmation du paiement.', error });
  }
};




exports.getFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const paiement = await Paiement.findById(id);

    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé.' });
    }

    if (paiement.studentId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à télécharger cette facture.' });
    }

    const factureFilename = `facture_${paiement._id}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename=${factureFilename}`);
    res.setHeader('Content-Type', 'application/pdf');

    res.sendFile(paiement.facturePath);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture.', error });
  }
};
