import Festival from '../models/Festival.js';

export const getFestivals = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const festivals = await Festival.find({ mandalId }).sort({ year: -1 });
    res.json(festivals);
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
    // If status is ACTIVE, make other festivals in this mandal UPCOMING or COMPLETED
    if (status === 'ACTIVE') {
      await Festival.updateMany({ mandalId }, { status: 'COMPLETED' });
    }

    const festival = await Festival.create({
      name,
      year,
      startDate,
      endDate,
      theme,
      budget,
      expectedDonation,
      status: status || 'UPCOMING',
      mandalId,
    });

    res.status(201).json(festival);
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
    const festival = await Festival.findOne({ _id: id, mandalId });
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    // If status updated to ACTIVE, mark others as COMPLETED
    if (status === 'ACTIVE' && festival.status !== 'ACTIVE') {
      await Festival.updateMany({ mandalId, _id: { $ne: id } }, { status: 'COMPLETED' });
    }

    festival.name = name || festival.name;
    festival.year = year || festival.year;
    if (startDate) festival.startDate = startDate;
    if (endDate) festival.endDate = endDate;
    festival.theme = theme !== undefined ? theme : festival.theme;
    if (budget !== undefined) festival.budget = budget;
    if (expectedDonation !== undefined) festival.expectedDonation = expectedDonation;
    festival.status = status || festival.status;

    await festival.save();
    res.json(festival);
  } catch (error) {
    console.error('Update festival error:', error);
    res.status(500).json({ message: 'Server error updating festival' });
  }
};
