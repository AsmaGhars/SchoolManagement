const io = require('socket.io')(); 

const Message = require('../models/Message');
const Parent = require('../models/Parent'); 
const Admin = require('../models/Admin'); 
const Teacher = require('../models/Teacher'); 

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id; 
        
        const { receiverId, content } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({ error: 'Sender or receiver is missing.' });
        }

        if (!content) {
            return res.status(400).json({ error: 'Content is required!' });
        }

        let sender = await Admin.findById(senderId);
        if (!sender) {
            sender = await Parent.findById(senderId);
            if (!sender) {
                sender = await Teacher.findById(senderId);
                if (!sender) {
                    return res.status(400).json({ error: 'Sender not found!' });
                }
            }
        }
        
        const senderModel = sender.constructor.modelName;
        if (!sender.isActive) {
            return res.status(403).json({ error: 'Sender account is not active.' });
        }
        

        let receiver = await Admin.findById(receiverId);
        if (!receiver) {
            receiver = await Parent.findById(receiverId);
            if (!receiver) {
                receiver = await Teacher.findById(receiverId);
                if (!receiver) {
                    return res.status(400).json({ error: 'Receiver not found!' });
                }
            }
        }                
        
        const receiverModel = receiver.role; 

        if (!receiver.isActive) {
            return res.status(403).json({ error: 'Receiver account is not active.' });
        }

        if (!['Parent', 'Teacher', 'Admin'].includes(senderModel) || !['Parent', 'Teacher', 'Admin'].includes(receiverModel)) {
            return res.status(400).json({ error: 'Invalid senderModel or receiverModel.' });
        }
        if (senderModel !== 'Admin' && receiverModel !== 'Admin') {
            if (sender.school.toString() !== receiver.school.toString()) {
                return res.status(403).json({ error: 'Sender and receiver must be linked to the same Admin.' });
            }
        } else if (senderModel === 'Admin') {            
            if (receiver.school.toString() !== sender._id.toString()) {
                return res.status(403).json({ error: 'Receiver must be linked to the Admin.' });
            }
        } else if (receiverModel === 'Admin') {
            if (sender.school.toString() !== receiver._id.toString()) {
                return res.status(403).json({ error: 'Sender must be linked to the Admin.' });
            }
        }else{
            if (sender.school.toString() !== receiver.school.toString()) {
                return res.status(403).json({ error: 'Sender and receiver must be linked to the same Admin.' });
            }
        }
        
        

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            senderModel,
            receiverModel,
            content
        });

        await message.save();
        req.io.emit('newMessage', message);

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.getReceivedMessages = async (req, res) => {
    try {
        const userId = req.user._id; 
        let user = await Admin.findById(userId);
        if (!user) {
            user = await Parent.findById(userId);
            if (!user) {
                user = await Teacher.findById(userId);
                if (!user) {
                    return res.status(400).json({ error: 'User not found!' });
                }
            }
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'User account is not active.' });
        }

        const messages = await Message.find({ receiver: userId }).populate('sender', 'name');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};
