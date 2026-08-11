import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

const getLanAddress = () => {
  const interfaces = networkInterfaces();
  const preferredNames = ["en0", "en1", "Wi-Fi", "Ethernet"];
  const names = [
    ...preferredNames.filter((name) => interfaces[name]),
    ...Object.keys(interfaces).filter((name) => !preferredNames.includes(name)),
  ];

  for (const name of names) {
    const address = interfaces[name]?.find(
      (candidate) =>
        candidate.family === "IPv4" &&
        !candidate.internal &&
        !candidate.address.startsWith("169.254.")
    );
    if (address) return address.address;
  }

  return null;
};

const lanAddress = process.env.KOKORO_API_HOST || getLanAddress();
if (!lanAddress) {
  console.error("Could not detect a LAN address. Connect the Mac to Wi-Fi or set KOKORO_API_HOST manually.");
  process.exit(1);
}

const apiPort = process.env.PORT || "5050";
const apiUrl = process.env.EXPO_PUBLIC_API_URL || `http://${lanAddress}:${apiPort}`;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const forwardedArgs = process.argv.slice(2);

console.log(`Kokoro mobile API: ${apiUrl}`);
console.log("The phone and Mac must be connected to the same local network.");

const expo = spawn(
  npmCommand,
  ["run", "start", "--prefix", "mobile", "--", "--lan", ...forwardedArgs],
  {
    env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
    stdio: "inherit",
  }
);

expo.on("error", (error) => {
  console.error(`Could not start Expo: ${error.message}`);
  process.exit(1);
});

expo.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
