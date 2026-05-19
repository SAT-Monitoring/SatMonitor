(function () {
  const machines = [
    { name: "Compactor 1", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "", speed: 0, lastUpdated: "26/01/2026 10:18:34" },
    { name: "Compactor 2", status: "Stopped", dailyHours: 2.6, totalHours: 2695.3, ip: "192.168.8.133", speed: 0.1, lastUpdated: "18/05/2026 15:27:18" },
    { name: "Stenter 3", status: "Stopped", dailyHours: 7.1, totalHours: 3066.1, ip: "192.168.8.116", speed: 0, lastUpdated: "18/05/2026 15:28:02" },
    { name: "Stenter 2", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "", speed: 0, lastUpdated: "26/01/2026 10:18:34" },
    { name: "Stenter 1", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "", speed: 0, lastUpdated: "26/01/2026 10:18:34" },
    { name: "Stenter 5", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "", speed: 0, lastUpdated: "26/01/2026 10:18:34" },
    { name: "Stenter 6", status: "Offline", dailyHours: 1.0, totalHours: 1.0, ip: "192.168.1.109", speed: 0, lastUpdated: "15/05/2026 07:11:03" },
    { name: "Syntex Drier", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "", speed: 0, lastUpdated: "28/10/2025 15:08:46" }
  ];

  function jitter(value, delta, min, max) {
    const next = value + (Math.random() * delta * 2 - delta);
    return Math.max(min, Math.min(max, next));
  }

  function randomStatus(current) {
    const pool = ["Running", "Stopped", "Offline", "Idle"];
    if (Math.random() < 0.7) return current;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- MQTT LIVE DATA INTEGRATION ---
  if (typeof mqtt !== 'undefined') {
    // Secure WebSockets (wss://) and port 8884 for browser connections
    const brokerUrl = "wss://fa57de5b1cfb45869f686d9e04b5f9f3.s1.eu.hivemq.cloud:8884/mqtt";
    const options = {
      username: "pamoda",
      password: "pamoda1U23",
      // Generate a random client ID to prevent connection collisions if you open multiple tabs
      clientId: "WebDash_" + Math.random().toString(16).substring(2, 10) 
    };

    const client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
      console.log("Connected to HiveMQ via WebSockets!");
      client.subscribe("telemetry/machines/Compactor2");
    });

    client.on("message", (topic, message) => {
      if (topic === "telemetry/machines/Compactor2") {
        try {
          const payload = JSON.parse(message.toString());
          const compactor2 = machines.find(m => m.name === "Compactor 2");
          
          if (compactor2) {
            // Update machine data with live MQTT values
            compactor2.status = payload.status === 1 ? "Running" : "Stopped";
            // Convert ESP32 minutes to Dashboard hours (2 decimals)
            compactor2.dailyHours = +(payload.dayRun / 60).toFixed(2);
            compactor2.totalHours = +(payload.totalRun / 60).toFixed(2);
            compactor2.ip = payload.ip;
            compactor2.speed = +(payload.speed).toFixed(2);
            
            // Generate current timestamp for last updated
            const now = new Date();
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, "0");
            const mins = String(now.getMinutes()).padStart(2, "0");
            const secs = String(now.getSeconds()).padStart(2, "0");
            compactor2.lastUpdated = `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
            
            // Force an immediate UI update when real data arrives
            if (typeof window.updateDashboard === "function") {
              window.updateDashboard({ machines });
            }
          }
        } catch (error) {
          console.error("Error parsing incoming MQTT JSON:", error);
        }
      }
    });
  } else {
    console.warn("MQTT library missing! Add <script src='https://unpkg.com/mqtt/dist/mqtt.min.js'></script> to your HTML.");
  }

  // --- SIMULATOR TICK ---
  function tick() {
    machines.forEach(machine => {
      // SKIP COMPACTOR 2: It is now controlled entirely by the live MQTT data above
      if (machine.name === "Compactor 2") return; 

      machine.status = randomStatus(machine.status);

      if (machine.status === "Running") {
        machine.speed = jitter(machine.speed || 120, 5, 60, 140);
        machine.dailyHours = jitter(machine.dailyHours, 0.2, 0, 24);
        machine.totalHours = jitter(machine.totalHours, 1.5, 0, 9999);
      } else {
        machine.speed = 0;
      }

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      machine.lastUpdated = day + "/" + month + "/" + year + " " + hours + ":" + mins + ":" + secs;
    });

    if (typeof window.updateDashboard === "function") {
      window.updateDashboard({ machines });
    }
  }

  setInterval(tick, 3000);
  tick();
})();
