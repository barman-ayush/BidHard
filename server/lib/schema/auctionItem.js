// models/AuctionItem.js
import { DataTypes } from "sequelize"
import sequelize from "../db/db.js"

const AuctionItem = sequelize.define("AuctionItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  startingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // ✅ FK → users.id (INTEGER → INTEGER)
  currentBidderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "SET NULL",
  },

  auctionEndTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("LIVE", "ENDED"),
    defaultValue: "LIVE",
  },

  version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
})

export default AuctionItem
