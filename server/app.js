import 'dotenv/config'
import express from 'express'
import cors from "cors"
import http from "http"
import { handleError } from './lib/error/error-handler.js'
import { initDB } from './lib/db/client.js'
import authRotes from "./routes/auth/route.js"
import adminRoutes from "./routes/admin/route.js"
import itemRoutes from "./routes/bid/route.js"
import { clerkMiddleware } from '@clerk/express'
import { initSocket } from "./socket/index.js"

const app = express()
const PORT = 3000

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())
app.use(clerkMiddleware())

await initDB()

app.use("/auth", authRotes)
app.use(adminRoutes)
app.use(itemRoutes)

app.use(handleError)

// 👇 Create HTTP server
const httpServer = http.createServer(app)

// 👇 Initialize socket
initSocket(httpServer)

// 👇 Listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`)
})
