import { DataTypes } from "sequelize"
import sequelize from "../db/db.js"

const Bid = sequelize.define("Bid", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  itemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "AuctionItems",
      key: "id",
    },
  },

  bidderId: {
    type: DataTypes.INTEGER, // users.id
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
})

export default Bid
