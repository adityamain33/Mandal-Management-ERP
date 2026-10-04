import { Festival } from '../models/index.js';
import { Op } from 'sequelize';

export const getFestivals = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const festivals = await Festival.findAll({
      where: { mandalId: Number(mandalId) },
      order: [['year', 'DESC']],
    });
    const formatted = festivals.map((f) => {
      const obj = f.toJSON();
      obj._id = f.id;
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving festivals' });
  }
};

export const createFestival = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, year, startDate, endDate, theme, budget, expectedDonation, status } = req.body;

  if (!name || !year || !startDate || !endDate) {
    return res.status(400).json({ message: 'Name, year, startDate, and endDate are required' });
  }

  try {
    // If status is ACTIVE, make other festivals in this mandal COMPLETED
    if (status === 'ACTIVE') {
      await Festival.update(
        { status: 'COMPLETED' },
        { where: { mandalId: Number(mandalId) } }
      );
    }

    const festival = await Festival.create({
      name: name.trim(),
      year: parseInt(year),
      startDate,
      endDate,
      theme: theme || null,
      budget: budget ? parseFloat(budget) : 0,
      expectedDonation: expectedDonation ? parseFloat(expectedDonation) : 0,
      status: status || 'UPCOMING',
      mandalId: Number(mandalId),
    });

    const resObj = festival.toJSON();
    resObj._id = festival.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create festival error:', error);
    res.status(500).json({ message: 'Server error creating festival' });
  }
};

export const updateFestival = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { name, year, startDate, endDate, theme, budget, expectedDonation, status } = req.body;

  try {
    const festival = await Festival.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    // If status updated to ACTIVE, mark others as COMPLETED
    if (status === 'ACTIVE' && festival.status !== 'ACTIVE') {
      await Festival.update(
        { status: 'COMPLETED' },
        { where: { mandalId: Number(mandalId), id: { [Op.ne]: id } } }
      );
    }

    if (name) festival.name = name.trim();
    if (year) festival.year = parseInt(year);
    if (startDate) festival.startDate = startDate;
    if (endDate) festival.endDate = endDate;
    if (theme !== undefined) festival.theme = theme;
    if (budget !== undefined) festival.budget = parseFloat(budget);
    if (expectedDonation !== undefined) festival.expectedDonation = parseFloat(expectedDonation);
    if (status) festival.status = status;

    await festival.save();
    const resObj = festival.toJSON();
    resObj._id = festival.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update festival error:', error);
    res.status(500).json({ message: 'Server error updating festival' });
  }
};
