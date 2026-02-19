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

  // FIXED: Check for passwordHash changes instead of password
  User.beforeSave(async (user) => {
    // Only hash if passwordHash is being set/changed directly
    if (user.changed('passwordHash')) {
      // We assume the passwordHash is being set with a plain text password
      // So we need to hash it
      const plainPassword = user.getDataValue('passwordHash');
      
      // Check if it's already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (plainPassword && !plainPassword.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        user.setDataValue('passwordHash', hashedPassword);
        console.log('🔐 Password hashed successfully');
      }
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