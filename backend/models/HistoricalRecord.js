const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistoricalRecord = sequelize.define('HistoricalRecord', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recordType: {
      type: DataTypes.ENUM('biography', 'land_record', 'cultural_artifact', 'oral_history', 'photograph', 'manuscript'),
      defaultValue: 'biography',
    },
    titleAm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleEn: {
      type: DataTypes.STRING,
    },
    descriptionAm: {
      type: DataTypes.TEXT,
    },
    descriptionEn: {
      type: DataTypes.TEXT,
    },
    era: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    locationGeocode: {
      type: DataTypes.STRING,
    },
    significanceLevel: {
      type: DataTypes.ENUM('national', 'regional', 'woreda', 'local'),
      defaultValue: 'local',
    },
    preservationStatus: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'digitized_only'),
      defaultValue: 'digitized_only',
    },
    source: {
      type: DataTypes.TEXT,
    },
    verificationStatus: {
      type: DataTypes.ENUM('verified', 'unverified', 'needs_review'),
      defaultValue: 'unverified',
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  }, {
    timestamps: true,
  });

  HistoricalRecord.associate = function(models) {
    HistoricalRecord.hasMany(models.Document, { foreignKey: 'recordId', as: 'Documents' });
  };

  return HistoricalRecord;
};