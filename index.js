const { spawn } = require("child_process");

function startBotProcess() {
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "monitor.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        console.log(`${script} process exited with code: ${codeExit}`);
        if (codeExit === 0) {
            // After system.js finishes successfully, run the Python script
            startPythonProcess();
        } else {
            setTimeout(() => startBotProcess(script), 3000); // Retry on failure
        }
    });

    child.on("error", (error) => {
        console.error(`An error occurred starting the ${script} process: ${error}`);
    });
}

function startPythonProcess() {
    const pythonChild = spawn("python3", ["index.py"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    pythonChild.on("close", (codeExit) => {
        console.log(`Python script exited with code: ${codeExit}`);
        if (codeExit !== 0) {
            setTimeout(() => startPythonProcess(), 3000); // Retry on failure
        }
    });

    pythonChild.on("error", (error) => {
        console.error(`An error occurred starting the Python process: ${error}`);
    });
}
startBotProcess();
