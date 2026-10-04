import { Volunteer, VolunteerTask, Member } from '../models/index.js';

export const getVolunteers = async (req, res) => {
  const mandalId = req.mandalId;
  const { department } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (department) where.department = department;

    const volunteers = await Volunteer.findAll({
      where,
      include: [{ model: Member, as: 'member' }],
    });

    const formatted = volunteers.map((v) => {
      const obj = v.toJSON();
      obj._id = v.id;
      obj.memberId = v.member ? { ...v.member.toJSON(), _id: v.member.id } : v.memberId;
      return obj;
    });

    res.json(formatted);
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
    const existingVolunteer = await Volunteer.findOne({
      where: { memberId: Number(memberId), mandalId: Number(mandalId) },
    });
    if (existingVolunteer) {
      return res.status(400).json({ message: 'This member is already registered as a volunteer' });
    }

    const volunteer = await Volunteer.create({
      memberId: Number(memberId),
      skills: Array.isArray(skills) ? skills : [],
      availability: availability || null,
      department,
      mandalId: Number(mandalId),
    });

    const resObj = volunteer.toJSON();
    resObj._id = volunteer.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create volunteer error:', error);
    res.status(500).json({ message: 'Server error registering volunteer' });
  }
};

export const getVolunteerTasks = async (req, res) => {
  const mandalId = req.mandalId;
  const { festivalId } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (festivalId) where.festivalId = Number(festivalId);

    const tasks = await VolunteerTask.findAll({
      where,
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'mobile'] }],
        },
      ],
      order: [['dueDate', 'ASC']],
    });

    const formatted = tasks.map((t) => {
      const obj = t.toJSON();
      obj._id = t.id;
      if (t.volunteer) {
        const vObj = t.volunteer.toJSON();
        vObj._id = t.volunteer.id;
        if (t.volunteer.member) {
          vObj.memberId = { ...t.volunteer.member.toJSON(), _id: t.volunteer.member.id };
        }
        obj.assignedTo = vObj;
      }
      return obj;
    });

    res.json(formatted);
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
      title: title.trim(),
      description: description ? description.trim() : null,
      assignedTo: Number(assignedTo),
      dueDate: dueDate || null,
      festivalId: Number(festivalId),
      mandalId: Number(mandalId),
    });

    const resObj = task.toJSON();
    resObj._id = task.id;
    res.status(201).json(resObj);
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
    const task = await VolunteerTask.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    const resObj = task.toJSON();
    resObj._id = task.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

export const logHours = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { hours } = req.body;

  try {
    const volunteer = await Volunteer.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    volunteer.hoursWorked = Number(volunteer.hoursWorked || 0) + parseFloat(hours || 0);
    await volunteer.save();

    const resObj = volunteer.toJSON();
    resObj._id = volunteer.id;
    res.json(resObj);
  } catch (error) {
    console.error('Log volunteer hours error:', error);
    res.status(500).json({ message: 'Server error logging volunteer hours' });
  }
};
