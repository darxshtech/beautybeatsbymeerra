const Billing = require('../../models/Billing');
const User = require('../../models/User');

class ReportService {
  /**
   * Aggregate overall sales report
   */
  async getSalesReport(startDate, endDate) {
    const data = await Billing.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      success: true,
      data
    };
  }

  /**
   * Aggregate customer demographics report
   */
  async getCustomerDemographics() {
    const total = await User.countDocuments({ role: 'CUSTOMER' });
    
    const byLoyalty = await User.aggregate([
      { $match: { role: 'CUSTOMER' } },
      {
        $bucket: {
          groupBy: "$loyaltyPoints",
          boundaries: [0, 50, 100, 500, 1000],
          default: "1000+"
        }
      }
    ]);

    return {
      success: true,
      data: {
        total,
        byLoyalty
      }
    };
  }

  /**
   * Export logic (Placeholder: would generate CSV or PDF using libraries)
   */
  async generateExport(format, dataType) {
     console.log(`[EXPORT ENGINE] Generating ${format} for ${dataType}`);
     // Mock URL for download
     return {
       success: true,
       downloadUrl: `/exports/report_${Date.now()}.${format}`
     };
  }
}

module.exports = new ReportService();
