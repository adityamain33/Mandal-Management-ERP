import { Event, Member, Volunteer } from '../models/index.js';

export const getEvents = async (req, res) => {
  const mandalId = req.mandalId;
  const { festivalId } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (festivalId) where.festivalId = Number(festivalId);

    const events = await Event.findAll({
      where,
      include: [
        { model: Member, as: 'coordinator', attributes: ['id', 'name', 'mobile'] },
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']],
    });

    const formatted = events.map((e) => {
      const obj = e.toJSON();
      obj._id = e.id;
      obj.coordinatorId = e.coordinator ? { ...e.coordinator.toJSON(), _id: e.coordinator.id } : e.coordinatorId;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error retrieving events' });
  }
};

export const createEvent = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, date, startTime, endTime, location, description, budget, coordinatorId, volunteers, festivalId } = req.body;

  if (!name || !date || !startTime || !festivalId) {
    return res.status(400).json({ message: 'Name, date, startTime, and festival are required' });
  }

  try {
    const event = await Event.create({
      name: name.trim(),
      date,
      startTime,
      endTime: endTime || null,
      location: location ? location.trim() : null,
      description: description ? description.trim() : null,
      budget: parseFloat(budget || 0),
      coordinatorId: coordinatorId ? Number(coordinatorId) : null,
      volunteers: Array.isArray(volunteers) ? volunteers : [],
      festivalId: Number(festivalId),
      mandalId: Number(mandalId),
    });

    const resObj = event.toJSON();
    resObj._id = event.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { name, date, startTime, endTime, location, description, budget, coordinatorId, volunteers, status } = req.body;

  try {
    const event = await Event.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (name) event.name = name.trim();
    if (date) event.date = date;
    if (startTime) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;
    if (budget !== undefined) event.budget = parseFloat(budget);
    if (coordinatorId !== undefined) event.coordinatorId = coordinatorId ? Number(coordinatorId) : null;
    if (volunteers !== undefined) event.volunteers = volunteers;
    if (status) event.status = status;

    await event.save();
    const resObj = event.toJSON();
    resObj._id = event.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const event = await Event.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event' });
  }
};
