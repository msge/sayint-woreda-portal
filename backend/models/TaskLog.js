const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskLog = sequelize.define('TaskLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
    },
    oldStatus: {
      type: DataTypes.STRING,
    },
    newStatus: {
      type: DataTypes.STRING,
    },
    minutesSpent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
  });

  TaskLog.associate = function(models) {
    TaskLog.belongsTo(models.Task, { foreignKey: 'taskId' });
    TaskLog.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
  };

  return TaskLog;
};