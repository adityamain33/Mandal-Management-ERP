import Volunteer from '../models/Volunteer.js';
import VolunteerTask from '../models/VolunteerTask.js';
import Member from '../models/Member.js';

export const getVolunteers = async (req, res) => {
  const mandalId = req.mandalId;
  const { department } = req.query;

  try {
    const query = { mandalId };
    if (department) query.department = department;

    const volunteers = await Volunteer.find(query).populate('memberId');
    res.json(volunteers);
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ message: 'Server error retrieving volunteers' });
  }
};

export const createVolunteer = async (req, res) => {
  const mandalId = req.mandalId;
  const { memberId, skills, availability, department } = req.body;

  if (!memberId || !department) {
    return res.status(400).json({ message: 'Member ID and department are required' });
  }

  try {
    const existingVolunteer = await Volunteer.findOne({ memberId, mandalId });
    if (existingVolunteer) {
      return res.status(400).json({ message: 'This member is already registered as a volunteer' });
    }

    const volunteer = await Volunteer.create({
      memberId,
      skills,
      availability,
      department,
      mandalId,
    });

    res.status(201).json(volunteer);
  } catch (error) {
    console.error('Create volunteer error:', error);
    res.status(500).json({ message: 'Server error registering volunteer' });
  }
};

export const getVolunteerTasks = async (req, res) => {
  const mandalId = req.mandalId;
  const { festivalId } = req.query;

  try {
    const query = { mandalId };
    if (festivalId) query.festivalId = festivalId;

    const tasks = await VolunteerTask.find(query)
      .populate({
        path: 'assignedTo',
        populate: { path: 'memberId', select: 'name mobile' },
      })
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error retrieving volunteer tasks' });
  }
};

export const createVolunteerTask = async (req, res) => {
  const mandalId = req.mandalId;
  const { title, description, assignedTo, dueDate, festivalId } = req.body;

  if (!title || !assignedTo || !festivalId) {
    return res.status(400).json({ message: 'Title, assignee, and festival are required' });
  }

  try {
    const task = await VolunteerTask.create({
      title,
      description,
      assignedTo,
      dueDate,
      festivalId,
      mandalId,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

export const updateVolunteerTaskStatus = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { status } = req.body;

  try {
    const task = await VolunteerTask.findOne({ _id: id, mandalId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

export const logHours = async (req, res) => {
  const { id } = req.params; // volunteer ID
  const mandalId = req.mandalId;
  const { hours } = req.body;

  try {
    const volunteer = await Volunteer.findOne({ _id: id, mandalId });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    volunteer.hoursWorked += parseFloat(hours || 0);
    await volunteer.save();
    res.json(volunteer);
  } catch (error) {
    console.error('Log volunteer hours error:', error);
    res.status(500).json({ message: 'Server error logging volunteer hours' });
  }
};
