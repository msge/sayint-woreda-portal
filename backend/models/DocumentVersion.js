const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentVersion = sequelize.define('DocumentVersion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    changes: {
      type: DataTypes.TEXT,
    },
    approvalDate: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
  });

  DocumentVersion.associate = function(models) {
    DocumentVersion.belongsTo(models.Document, { foreignKey: 'documentId' });
    DocumentVersion.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'Approver' });
  };

  return DocumentVersion;
};