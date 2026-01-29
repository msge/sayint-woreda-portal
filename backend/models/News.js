const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const News = sequelize.define('News', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    headlineAm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    headlineEn: {
      type: DataTypes.STRING,
    },
    contentAm: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contentEn: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.ENUM('announcement', 'event', 'achievement', 'general'),
      defaultValue: 'general',
    },
    featuredImage: {
      type: DataTypes.STRING,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      }
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['category'] },
      { fields: ['isPublished'] },
      { fields: ['publishedAt'] },
    ],
  });

  // Before create hook to generate slug
  News.beforeCreate(async (news) => {
    if (!news.slug) {
      const baseSlug = news.headlineAm
        .toLowerCase()
        .replace(/[^\w\u1200-\u137F]+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      while (await News.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      news.slug = slug;
    }
  });

  News.associate = function(models) {
    News.belongsTo(models.User, { foreignKey: 'authorId', as: 'Author' });
  };

  return News;
};