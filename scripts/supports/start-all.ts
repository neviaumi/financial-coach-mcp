const serverPrefix = "\x1b[36m[server]\x1b[0m"; // Cyan
const clientPrefix = "\x1b[35m[client]\x1b[0m"; // Magenta

async function pipeStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  prefix: string,
  streamType: "stdout" | "stderr",
) {
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (streamType === "stderr") {
          console.error(`${prefix} ${line}`);
        } else {
          console.log(`${prefix} ${line}`);
        }
      }
    }
    if (buffer) {
      if (streamType === "stderr") {
        console.error(`${prefix} ${buffer}`);
      } else {
        console.log(`${prefix} ${buffer}`);
      }
    }
  } catch (_err) {
    // Stream closed or read error
  }
}

const serverCommand = new Deno.Command("deno", {
  args: ["task", "-f", "@app/server", "start"],
  stdout: "piped",
  stderr: "piped",
});

const apiBaseUrl = Deno.env.get("VITE_API_BASE_URL") ?? "http://localhost:8084";
const clientCommand = new Deno.Command("deno", {
  args: ["task", "-f", "@app/web-client", "start"],
  env: {
    ...Deno.env.toObject(),
    VITE_API_BASE_URL: apiBaseUrl,
  },
  stdout: "piped",
  stderr: "piped",
});

console.log(`${serverPrefix} Starting server task...`);
const serverChild = serverCommand.spawn();

console.log(
  `${clientPrefix} Starting web-client task with VITE_API_BASE_URL=${apiBaseUrl}...`,
);
const clientChild = clientCommand.spawn();

let exiting = false;

function cleanup() {
  if (exiting) return;
  exiting = true;
  console.log("\nShutting down both processes...");
  try {
    serverChild.kill("SIGINT");
  } catch (_) {
    // ignore
  }
  try {
    clientChild.kill("SIGINT");
  } catch (_) {
    // ignore
  }
}

Deno.addSignalListener("SIGINT", () => {
  cleanup();
  Deno.exit(0);
});

Deno.addSignalListener("SIGTERM", () => {
  cleanup();
  Deno.exit(0);
});

// Stream logs in background
const serverStdoutReader = serverChild.stdout.getReader();
const serverStderrReader = serverChild.stderr.getReader();
const clientStdoutReader = clientChild.stdout.getReader();
const clientStderrReader = clientChild.stderr.getReader();

pipeStream(serverStdoutReader, serverPrefix, "stdout");
pipeStream(serverStderrReader, serverPrefix, "stderr");
pipeStream(clientStdoutReader, clientPrefix, "stdout");
pipeStream(clientStderrReader, clientPrefix, "stderr");

// Wait for either to exit
const serverStatusPromise = serverChild.status;
const clientStatusPromise = clientChild.status;

Promise.any([serverStatusPromise, clientStatusPromise]).then((status) => {
  console.log(
    `One of the child processes exited (code: ${status.code}, success: ${status.success}). Shutting down...`,
  );
  cleanup();
  Deno.exit(status.code);
});
