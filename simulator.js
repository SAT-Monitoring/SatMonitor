(function () {
  // 1. Initialize all machines to a clean, offline baseline state
  const machines = [
    { name: "Compactor 1", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Compactor 2", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 3", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 2", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 1", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 5", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 6", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Syntex Drier", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." }
  ];

  // --- MQTT LIVE DATA INTEGRATION ---
  if (typeof mqtt !== 'undefined') {
    const brokerUrl = "wss://fa57de5b1cfb45869f686d9e04b5f9f3.s1.eu.hivemq.cloud:8884/mqtt";
    const options = {
      username: "pamoda",
      password: "pamoda1U23",
      // Generate random client ID so multiple browsers/tabs don't kick each other offline
      clientId: "WebDash_" + Math.random().toString(16).substring(2, 10) 
    };

    const client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
      console.log("Connected to HiveMQ via WebSockets!");
      // The '#' wildcard listens to ALL machines publishing to this path
      client.subscribe("telemetry/machines/#"); 
    });

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        
        // The ESP32 sends {"machine": "Compactor2", ...}
        const incomingName = payload.machine; 
        
        // Find the matching machine in our array. 
        // We remove spaces (e.g., "Compactor 2" -> "Compactor2") to ensure a perfect match.
        const targetMachine = machines.find(m => 
          m.name.replace(/\s/g, '').toLowerCase() === incomingName.replace(/\s/g, '').toLowerCase()
        );
        
        if (targetMachine) {
          // Update the specific machine's data with live MQTT values
          targetMachine.status = payload.status === 1 ? "Running" : "Stopped";
          targetMachine.dailyHours = +(payload.dayRun / 60).toFixed(2);
          targetMachine.totalHours = +(payload.totalRun / 60).toFixed(2);
          targetMachine.ip = payload.ip;
          targetMachine.speed = +(payload.speed).toFixed(2);
          
          // Generate current timestamp for last updated
          const now = new Date();
          const day = String(now.getDate()).padStart(2, "0");
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const year = now.getFullYear();
          const hours = String(now.getHours()).padStart(2, "0");
          const mins = String(now.getMinutes()).padStart(2, "0");
          const secs = String(now.getSeconds()).padStart(2, "0");
          targetMachine.lastUpdated = `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
          
          // Force an immediate UI update now that new data has arrived
          if (typeof window.updateDashboard === "function") {
            window.updateDashboard({ machines });
          }
        }
      } catch (error) {
        console.error("Error parsing incoming MQTT JSON:", error);
      }
    });
  } else {
    console.error("MQTT library missing! Dashboard will not update.");
  }

  // --- INITIAL RENDER ---
  // Draw the baseline (Offline/0.0) dashboard immediately when the page loads.
  // A small timeout ensures the HTML DOM is fully ready before drawing.
  setTimeout(() => {
    if (typeof window.updateDashboard === "function") {
      window.updateDashboard({ machines });
    }
  }, 150);

})();
