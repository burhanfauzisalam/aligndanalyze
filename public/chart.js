const server = "http://54.179.124.238:5003";
const socket = io(server);

const customID = "device01";
let data;

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
  socket.emit("get-average");
  socket.on("average-data", (data) => {
    console.log("Average data received:", data);
    // Data dua bilangan
    const bilangan1 = [90];
    const selisih = bilangan1 - data.average;

    console.log(data);
    // Data untuk pie chart
    const dataPie = [Math.round(selisih), Math.round(data.average), bilangan1];
    const labelsPie = [`Selisih`, `Rata-rata`, `Normal`];

    // Buat pie chart
    const ctx = document.getElementById("pieChart").getContext("2d");
    const pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labelsPie,
        datasets: [
          {
            label: "Proporsi Data",
            data: dataPie,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(75, 192, 81, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgb(47, 160, 56)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: "top", // Posisi legenda
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const value = tooltipItem.raw;
                return `${tooltipItem.label}: ${value}`;
              },
            },
          },
        },
      },
    });
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
