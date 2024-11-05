import os from "os";
import io from "socket.io-client";

let socket = io("http://127.0.0.1:3000/");

socket.on("connect", () => {
  const systemPerformance = performanceInfo();
  const intervalId = setInterval(() => {
    socket.emit("perData", systemPerformance);
  }, 2000);

  socket.on("getData", (data) => {
    console.log("real time data:", data);
  });

  socket.on("disconnect", () => {
    clearInterval(intervalId);
  });
});

export function performanceInfo() {
  const osType: string = os.type() === "Darwin" ? "Mac" : os.type();

  const upTime: number = os.uptime();

  const freeMem: number = os.freemem();
  const totalMem: number = os.totalmem();

  const usedMem: number = totalMem - freeMem;
  const memUsage: number = (usedMem / totalMem) * 100;

  interface CPUInfo {
    model: string;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }

  const cpuInfo: CPUInfo[] = os.cpus();

  let timesBefore = os.cpus().map((c) => c.times);

  function getAverageUsage(): number {
    let timesAfter = os.cpus().map((c) => c.times);
    let timeDeltas = timesAfter.map((t, i) => ({
      user: t.user - timesBefore[i].user,
      sys: t.sys - timesBefore[i].sys,
      idle: t.idle - timesBefore[i].idle,
    }));

    timesBefore = timesAfter;

    const avgLoad =
      timeDeltas
        .map((times) => 1 - times.idle / (times.user + times.sys + times.idle))
        .reduce((l1, l2) => l1 + l2) / timeDeltas.length;

    return avgLoad * 100;
  }

  let cpuLoad = getAverageUsage();

  setInterval(() => {
    cpuLoad = getAverageUsage();
  }, 2000);

  return {
    osType,
    upTime,
    freeMem,
    totalMem,
    usedMem,
    memUsage,
    cpuModel: cpuInfo[0].model,
    numCores: cpuInfo.length,
    get cpuLoad() {
      return cpuLoad;
    },
  };
}
