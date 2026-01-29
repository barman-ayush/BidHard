// sockets/dashboard.socket.js

export function registerDashboardSocket(io, socket) {
  socket.on("JOIN_DASHBOARD", ({ userId }) => {
    socket.join("dashboard");
    console.log(`📊 User ${userId} joined DASHBOARD`);
  });

  socket.on("LEAVE_DASHBOARD", () => {
    socket.leave("dashboard");
    console.log("📊 User left DASHBOARD");
  });
}
