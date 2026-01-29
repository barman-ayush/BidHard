import sequelize from "./db.js"
import "../schema/user.js"   
import "../schema/auctionItem.js"   
import "../schema/bid.js"   
import "../schema/index.js"   

export async function initDB() {
  try {
    await sequelize.authenticate()
    console.log("Database connected")

    await sequelize.sync()
    console.log("Tables synced")

  } catch (error) {
    console.error("DB error:", error)
    process.exit(1)
  }
}

export default sequelize
