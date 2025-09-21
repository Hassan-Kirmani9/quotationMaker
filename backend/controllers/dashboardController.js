const Quotation = require("../models/Quotation");

const stats = async (req, res) => {
  const userId = req.user._id;

  const stats = await Quotation.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalCount = await Quotation.countDocuments({ user: userId });
  const totalValue = await Quotation.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const recentQuotations = await Quotation.find({ user: userId })
    .populate("client", "name businessName")
    .sort({ createdAt: -1 })
    .limit(5)
    .select("quotationNo title totalAmount status createdAt");

  res.json({
    success: true,
    data: {
      stats: {
        total: totalCount,
        totalValue: totalValue[0]?.total || 0,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount,
          };
          return acc;
        }, {}),
      },
      recentQuotations,
    },
  });
};

module.exports = {
  stats,
};
