import sequelize from "./db.js"
import "../schema/user.js"   // 👈 IMPORTANT: register models
import "../schema/auctionItem.js"   // 👈 IMPORTANT: register models
import "../schema/bid.js"   // 👈 IMPORTANT: register models

export async function initDB() {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connected")

    // 🔥 CREATE TABLES IF NOT EXISTS
    await sequelize.sync()
    console.log("🧱 Tables synced")

  } catch (error) {
    console.error("❌ DB error:", error)
    process.exit(1)
  }
}

export default sequelize
