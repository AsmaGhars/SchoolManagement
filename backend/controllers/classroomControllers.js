const Classroom = require('../models/Classroom');


const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

exports.createClassroom = async (req, res) => {
  try {
    const {name} = req.body;
    const adminId = req.user._id;

    if (!name) {
        return res.status(400).json({ msg: "Classroom name is required" });
    }
    const normalizedName = capitalizeFirstLetter(name.trim());
    const existingClassroom = await Classroom.findOne({ name: normalizedName });
    if (existingClassroom) {
        return res.status(409).json({ message: 'Classroom name already exists. It must be unique.' });
    }
    const classroom = new Classroom({
        name: normalizedName,
        school: adminId,
    });
    await classroom.save();
    res.status(201).json({ message: 'Classroom created successfully', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Error creating classroom:', error });
  }
};

exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ school: req.user._id }).populate('schedule.course');
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id).populate('schedule.course');
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    if (classroom.school._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view this class" });
    }
    res.status(200).json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.school.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this classroom" });
    }

    const normalizedName = name ? capitalizeFirstLetter(name.trim()) : null;

    if (normalizedName) {
      const existingClassroom = await Classroom.findOne({ 
        name: normalizedName, 
        _id: { $ne: id } 
      });

      if (existingClassroom) {
        return res.status(409).json({ message: 'Classroom name already exists. It must be unique.' });
      }
    }

    classroom.name = normalizedName || classroom.name;
    
    await classroom.save();

    res.status(200).json({ message: 'Classroom updated successfully', classroom });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.school.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this classroom" });
    }

    await Classroom.findByIdAndDelete(id);

    res.status(200).json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
