const Carpool = require('../models/carpool');

exports.createCarpool = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user._id;
    payload.seatsRemaining = payload.totalSeats;
    const cp = await Carpool.create(payload);
    res.status(201).json({ carpool: cp });
  } catch (err) {
    next(err);
  }
};

exports.getAllCarpools = async (req, res) => {
  const userId = req.user._id;

  const list = await Carpool.find()
    .populate("createdBy", "name")
    .lean();  // lean = plain objects (easier to add fields)

  const updated = list.map(c => {
    const joined = c.passengers?.some(p => String(p.user) === String(userId));
    return { ...c, joined };
  });

  res.json({ carpools: updated });
};


exports.joinCarpool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { seats } = req.body;

    const cp = await Carpool.findById(id);
    if (!cp) return res.status(404).json({ message: 'Carpool not found' });
    if (cp.status !== 'open') return res.status(400).json({ message: 'Carpool not open' });
    if (cp.seatsRemaining < seats)
      return res.status(400).json({ message: 'Not enough seats' });

    cp.passengers.push({ user: req.user._id, seatsBooked: seats });
    cp.seatsRemaining -= seats;
    if (cp.seatsRemaining === 0) cp.status = 'closed';

    await cp.save();
    res.json({ carpool: cp });
  } catch (err) {
    next(err);
  }
};
