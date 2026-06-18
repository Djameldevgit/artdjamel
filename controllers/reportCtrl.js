// 📂 backend/controllers/reportCtrl.js
// SOLO PARA VIDEOS - Eliminado todo lo relacionado con posts

const Video = require('../models/videoModel');
const Report = require('../models/reportModel');
const Users = require('../models/userModel');

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 9
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this;
  }
}

const reportCtrl = {
  createReport: async (req, res) => {
    try {
      const { videoId, userId, reason } = req.body;
      const reportedBy = req.user._id;
  
      if (!videoId || !userId || !reason) {
        return res.status(400).json({ msg: req.__('report.missing_fields') });
      }
  
      // Verificar que el video existe
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ msg: "El video no existe" });
      }
  
      // Verificar si ya existe un reporte duplicado
      const existingReport = await Report.findOne({ videoId, reportedBy });
  
      if (existingReport) {
        return res.status(400).json({ msg: req.__('report.already_reported') });
      }
  
      const newReport = new Report({
        videoId,      // Cambiado: antes era postId
        userId,
        reportedBy,
        reason,
      });
  
      await newReport.save();
      res.json({ msg: req.__('report.create_success') });
    } catch (err) {
      console.error('❌ Error createReport:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  },
  
  getReports: async (req, res) => {
    try {
      const reports = await Report.find()
        .populate("userId", "username avatar")
        .populate("reportedBy", "username avatar")
        .populate({
          path: "videoId",    // Cambiado: antes era postId
          select: "title description url user",
          populate: {
            path: "user",
            select: "username avatar"
          }
        })
        .exec();

      res.json({ reports, result: reports.length });
    } catch (err) {
      console.error('❌ Error getReports:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  },

  getMostReportedUsers: async (req, res) => {
    try {
      const mostReportedUsers = await Report.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            count: 1,
            "user.username": 1,
            "user.avatar": 1,
          },
        },
      ]);

      res.json({ mostReportedUsers });
    } catch (err) {
      console.error('❌ Error getMostReportedUsers:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  },

  getMostActiveReporters: async (req, res) => {
    try {
      const mostActiveReporters = await Report.aggregate([
        { $group: { _id: "$reportedBy", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            count: 1,
            "user.username": 1,
            "user.avatar": 1,
          },
        },
      ]);

      res.json({ mostActiveReporters });
    } catch (err) {
      console.error('❌ Error getMostActiveReporters:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  },

  // Nuevo: Obtener reportes por video específico
  getReportsByVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      
      const reports = await Report.find({ videoId })
        .populate("userId", "username avatar")
        .populate("reportedBy", "username avatar")
        .sort({ createdAt: -1 });

      res.json({ 
        success: true, 
        reports, 
        count: reports.length 
      });
    } catch (err) {
      console.error('❌ Error getReportsByVideo:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  },

  // Nuevo: Resolver/Eliminar reporte
  resolveReport: async (req, res) => {
    try {
      const { reportId } = req.params;
      
      // Solo admin puede resolver reportes
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "No autorizado" });
      }

      const report = await Report.findByIdAndDelete(reportId);
      
      if (!report) {
        return res.status(404).json({ msg: "Reporte no encontrado" });
      }

      res.json({ 
        success: true, 
        msg: "Reporte resuelto y eliminado" 
      });
    } catch (err) {
      console.error('❌ Error resolveReport:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  },

  // Nuevo: Obtener estadísticas de reportes
  getReportStats: async (req, res) => {
    try {
      // Solo admin puede ver estadísticas
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "No autorizado" });
      }

      const totalReports = await Report.countDocuments();
      
      const reportsByReason = await Report.aggregate([
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const reportsLast7Days = await Report.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        stats: {
          totalReports,
          reportsByReason,
          reportsLast7Days
        }
      });
    } catch (err) {
      console.error('❌ Error getReportStats:', err);
      return res.status(500).json({ msg: req.__('report.server_error') });
    }
  }
};

module.exports = reportCtrl;