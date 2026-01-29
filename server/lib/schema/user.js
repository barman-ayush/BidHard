import { DataTypes } from "sequelize"
import sequelize from "../db/db.js"

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
    },

    lastName: {
      type: DataTypes.STRING,
    },

    imageUrl: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users",
    timestamps: true, // createdAt, updatedAt
  }
)

export default User
