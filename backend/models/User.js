const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    fullNameAm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullNameEn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    department: {
      type: DataTypes.ENUM('Communication', 'Archives', 'Administration', 'IT'),
      defaultValue: 'Administration',
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'editor', 'viewer'),
      defaultValue: 'viewer',
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    timestamps: true,
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['department'] },
    ],
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
  };

  // Hooks
  User.beforeSave(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(user.password, salt);
    }
  });

  User.associate = function(models) {
    User.hasMany(models.Document, { foreignKey: 'uploadedBy', as: 'UploadedDocuments' });
    User.hasMany(models.Task, { foreignKey: 'assignedTo', as: 'AssignedTasks' });
    User.hasMany(models.Task, { foreignKey: 'createdBy', as: 'CreatedTasks' });
    User.hasMany(models.News, { foreignKey: 'authorId', as: 'AuthoredNews' });
    User.hasMany(models.DocumentVersion, { foreignKey: 'approvedBy', as: 'ApprovedVersions' });
  };

  return User;
};