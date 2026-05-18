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

  function tick() {
    machines.forEach(machine => {
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
