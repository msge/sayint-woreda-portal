const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskCode: {
      type: DataTypes.STRING,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'review', 'completed', 'blocked'),
      defaultValue: 'pending',
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    estimatedHours: {
      type: DataTypes.INTEGER,
    },
    actualHours: {
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
  });

  // Before create hook to generate taskCode
  Task.beforeCreate(async (task) => {
    if (!task.taskCode) {
      const year = new Date().getFullYear();
      const count = await Task.count({
        where: {
          createdAt: {
            [sequelize.Op.gte]: new Date(`${year}-01-01`),
            [sequelize.Op.lt]: new Date(`${year + 1}-01-01`),
          }
        }
      });
      task.taskCode = `SAY/TASK/${year}/${String(count + 1).padStart(4, '0')}`;
    }
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'Assignee' });
    Task.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
    Task.hasMany(models.TaskLog, { foreignKey: 'taskId', as: 'Logs' });
  };

  return Task;
};