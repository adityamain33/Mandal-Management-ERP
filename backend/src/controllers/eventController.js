import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  const mandalId = req.mandalId;
  const { festivalId } = req.query;

  try {
    const query = { mandalId };
    if (festivalId) query.festivalId = festivalId;

    const events = await Event.find(query)
      .populate('coordinatorId', 'name mobile')
      .populate({
        path: 'volunteers',
        populate: { path: 'memberId', select: 'name' }
      })
      .sort({ date: 1, startTime: 1 });

    res.json(events);
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
      name,
      date,
      startTime,
      endTime,
      location,
      description,
      budget: parseFloat(budget || 0),
      coordinatorId: coordinatorId || null,
      volunteers: volunteers || [],
      festivalId,
      mandalId,
    });
    res.status(201).json(event);
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
    const event = await Event.findOne({ _id: id, mandalId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    if (date) event.date = date;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime !== undefined ? endTime : event.endTime;
    event.location = location !== undefined ? location : event.location;
    event.description = description !== undefined ? description : event.description;
    if (budget !== undefined) event.budget = parseFloat(budget);
    event.coordinatorId = coordinatorId !== undefined ? coordinatorId : event.coordinatorId;
    event.volunteers = volunteers !== undefined ? volunteers : event.volunteers;
    event.status = status || event.status;

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const event = await Event.findOneAndDelete({ _id: id, mandalId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event' });
  }
};
