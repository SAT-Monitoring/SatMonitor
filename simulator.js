(function () {
  const machines = [
    { name: "Compactor 1", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Compactor 2", status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 3",   status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 2",   status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 1",   status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 5",   status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Stenter 6",   status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." },
    { name: "Syntex Drier",status: "Offline", dailyHours: 0.0, totalHours: 0.0, ip: "—", speed: 0, lastUpdated: "Waiting for data..." }
  ];

  if (typeof mqtt !== 'undefined') {
    const brokerUrl = "wss://fa57de5b1cfb45869f686d9e04b5f9f3.s1.eu.hivemq.cloud:8884/mqtt";
    const options = {
      username: "pamoda",
      password: "pamoda1U23",
      clientId: "WebDash_" + Math.random().toString(16).substring(2, 10)
    };

    const client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
      console.log("Connected to HiveMQ via WebSockets!");
      client.subscribe("telemetry/machines/#");
    });

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        const incomingName = payload.machine;

        const targetMachine = machines.find(m =>
          m.name.replace(/\s/g, '').toLowerCase() === incomingName.replace(/\s/g, '').toLowerCase()
        );

        if (targetMachine) {
          targetMachine.status     = payload.status === 1 ? "Running" : "Stopped";
          targetMachine.dailyHours = +(payload.dayRun / 60).toFixed(2);
          targetMachine.totalHours = +(payload.totalRun / 60).toFixed(2);
          targetMachine.ip         = payload.ip;
          targetMachine.speed      = +(payload.speed).toFixed(2);

          const now = new Date();
          const dd  = String(now.getDate()).padStart(2, "0");
          const mm  = String(now.getMonth() + 1).padStart(2, "0");
          const yyyy = now.getFullYear();
          const hh  = String(now.getHours()).padStart(2, "0");
          const min = String(now.getMinutes()).padStart(2, "0");
          const ss  = String(now.getSeconds()).padStart(2, "0");
          targetMachine.lastUpdated = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

          // Update the global live indicator
          if (typeof window.setLiveReceived === "function") {
            window.setLiveReceived();
          }

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

  setTimeout(() => {
    if (typeof window.updateDashboard === "function") {
      window.updateDashboard({ machines });
    }
  }, 150);

})();