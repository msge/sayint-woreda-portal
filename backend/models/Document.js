const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    docId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
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
    category: {
      type: DataTypes.ENUM(
        'historical_record',
        'government_notice',
        'news',
        'biography',
        'administrative',
        'cultural_heritage',
        'form_template'
      ),
      defaultValue: 'administrative',
    },
    documentType: {
      type: DataTypes.ENUM('pdf', 'image', 'word', 'excel', 'scanned', 'text'),
      defaultValue: 'pdf',
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
    },
    thumbnailPath: {
      type: DataTypes.STRING,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    language: {
      type: DataTypes.ENUM('am', 'en', 'both'),
      defaultValue: 'am',
    },
    keywords: {
      type: DataTypes.TEXT, // Will store as JSON string
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('keywords');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('keywords', JSON.stringify(value || []));
      }
    },
    accessLevel: {
      type: DataTypes.ENUM('public', 'restricted', 'confidential'),
      defaultValue: 'restricted',
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['docId'] },
      { fields: ['category'] },
      { fields: ['accessLevel'] },
      { fields: ['publishedAt'] },
    ],
  });

  // Before create hook to generate docId
  Document.beforeCreate(async (document) => {
    if (!document.docId) {
      const year = new Date().getFullYear();
      const count = await Document.count({
        where: {
          createdAt: {
            [sequelize.Op.gte]: new Date(`${year}-01-01`),
            [sequelize.Op.lt]: new Date(`${year + 1}-01-01`),
          }
        }
      });
      document.docId = `SAY/DOC/${year}/${String(count + 1).padStart(4, '0')}`;
    }
  });

  Document.associate = function(models) {
    Document.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'Uploader' });
    Document.hasMany(models.DocumentVersion, { foreignKey: 'documentId', as: 'Versions' });
    Document.belongsTo(models.HistoricalRecord, { foreignKey: 'recordId', as: 'HistoricalRecord' });
  };

  return Document;
};