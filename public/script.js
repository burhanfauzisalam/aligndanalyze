const server = "http://localhost:5003";
const socket = io(server);

const customID = "device01";

console.log(customID);

if (!customID) {
  console.log(`Please login first`);
} else {
  // Koneksi WebSocket menggunakan socket.io
  // const socket = io('https://server.habito.id');
  const socket = io(server); // Pastikan URL ini sesuai dengan server Anda

  socket.on("mqtt-status", (data) => {
    // Perbarui status perangkat
    console.log(data.message);
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
    //   const customId = localStorage.getItem("username");
    const customId = "device01";
    socket.emit("set-custom-id", customId);
  });
}

// Capitalize helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fungsi untuk logout
function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}
