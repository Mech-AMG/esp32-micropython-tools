const vscode = require("vscode");
const path = require("path");
const cp = require("child_process");

let outputChannel;
let lastSidebarCommand = null;
const ownedExecutions = new Set();

function activate(context) {
    console.log("ESP32 MicroPython Tools activated");

    outputChannel = vscode.window.createOutputChannel("ESP32 MicroPython");

    const provider = new ESP32ToolsViewProvider(context.extensionUri);

    context.subscriptions.push(
        outputChannel,

        vscode.window.registerWebviewViewProvider(
            "esp32ToolsView",
            provider
        ),

        vscode.commands.registerCommand("esp32.selectPort", selectPort),
        vscode.commands.registerCommand("esp32.checkPorts", checkPorts),
        vscode.commands.registerCommand("esp32.uploadPermanent", uploadPermanent),
        vscode.commands.registerCommand("esp32.runTemporary", runTemporary),
        vscode.commands.registerCommand("esp32.reset", resetBoard),
        vscode.commands.registerCommand("esp32.listFiles", listFiles),
        vscode.commands.registerCommand("esp32.stopPermanent", stopPermanent),
        vscode.commands.registerCommand("esp32.monitor", monitorBoard),
        vscode.commands.registerCommand("esp32.closeTerminals", closeEsp32TaskTerminals),

        vscode.tasks.onDidEndTaskProcess((event) => {
            if (!ownedExecutions.has(event.execution)) {
                return;
            }

            ownedExecutions.delete(event.execution);

            if (event.exitCode === undefined) {
                vscode.window.setStatusBarMessage("ESP32 task stopped", 1500);
                return;
            }

            const config = vscode.workspace.getConfiguration("esp32");
            const autoClose = config.get("autoCloseTerminal", true);

            if (autoClose && event.execution.task.name !== "ESP32 Monitor") {
                setTimeout(() => {
                    closeEsp32TaskTerminals();
                }, 700);
            }

            if (event.exitCode === 0) {
                vscode.window.setStatusBarMessage("ESP32 command finished", 3000);
            } else {
                vscode.window.showErrorMessage(
                    `ESP32 command failed. Exit code: ${event.exitCode}`
                );
            }
        })
    );

    vscode.window.setStatusBarMessage("ESP32 MicroPython Tools ready", 3000);
}

class ESP32ToolsViewProvider {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, "images")
            ]
        };

        const iconUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "images", "icon.png")
        );

        webviewView.webview.html = getWebviewHtml(iconUri);

        webviewView.webview.onDidReceiveMessage((message) => {
            const command = message.command;

            if (command === "closeTerminals") {
                closeEsp32TaskTerminals();
                lastSidebarCommand = null;
                return;
            }

            if (lastSidebarCommand && lastSidebarCommand !== command) {
                closeEsp32TaskTerminals();
            }

            lastSidebarCommand = command;

            setTimeout(() => {
                switch (command) {
                    case "selectPort":
                        vscode.commands.executeCommand("esp32.selectPort");
                        break;

                    case "checkPorts":
                        vscode.commands.executeCommand("esp32.checkPorts");
                        break;

                    case "uploadPermanent":
                        vscode.commands.executeCommand("esp32.uploadPermanent");
                        break;

                    case "runTemporary":
                        vscode.commands.executeCommand("esp32.runTemporary");
                        break;

                    case "reset":
                        vscode.commands.executeCommand("esp32.reset");
                        break;

                    case "listFiles":
                        vscode.commands.executeCommand("esp32.listFiles");
                        break;

                    case "stopPermanent":
                        vscode.commands.executeCommand("esp32.stopPermanent");
                        break;

                    case "monitor":
                        vscode.commands.executeCommand("esp32.monitor");
                        break;
                }
            }, 500);
        });
    }
}

function getWebviewHtml(iconUri) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    body {
        padding: 12px;
        font-family: var(--vscode-font-family);
        color: var(--vscode-foreground);
        background: var(--vscode-sideBar-background);
    }

    .header {
        text-align: center;
        margin-bottom: 16px;
    }

    .logo-img {
        width: 92px;
        height: 92px;
        margin: 0 auto 10px auto;
        display: block;
        border-radius: 22px;
        box-shadow: 0 0 18px rgba(0, 122, 204, 0.45);
    }

    h2 {
        font-size: 18px;
        margin: 8px 0;
        font-weight: 700;
    }

    p {
        font-size: 12px;
        opacity: 0.75;
        margin-bottom: 14px;
    }

    button {
        width: 100%;
        padding: 11px;
        margin-bottom: 8px;
        border: none;
        border-radius: 8px;
        color: white;
        background: #007acc;
        cursor: pointer;
        font-size: 13px;
        text-align: left;
        font-weight: 600;
    }

    button:hover {
        filter: brightness(1.12);
    }

    .purple {
        background: #6f42c1;
    }

    .green {
        background: #16825d;
    }

    .orange {
        background: #b86b00;
    }

    .danger {
        background: #c0392b;
    }

    .gray {
        background: #555;
    }

    .small {
        margin-top: 12px;
        font-size: 11px;
        opacity: 0.75;
        line-height: 1.5;
    }
</style>
</head>
<body>
    <div class="header">
        <img class="logo-img" src="${iconUri}" alt="ESP32 Icon">
        <h2>MicroPython Tools</h2>
        <p>Global ESP32 commands</p>
    </div>

    <button class="purple" onclick="send('selectPort')">🔎 Select Port</button>
    <button onclick="send('checkPorts')">🔌 Check Ports</button>
    <button class="green" onclick="send('uploadPermanent')">⬆️ Upload Permanent</button>
    <button onclick="send('runTemporary')">▶️ Run Temporary</button>
    <button class="orange" onclick="send('reset')">🔄 Reset ESP32</button>
    <button onclick="send('listFiles')">📁 List Files</button>
    <button class="danger" onclick="send('stopPermanent')">⛔ Stop Permanent</button>
    <button class="green" onclick="send('monitor')">🖥️ Monitor</button>
    <button class="gray" onclick="send('closeTerminals')">❌ Close ESP32 Terminals</button>

   
<script>
    const vscode = acquireVsCodeApi();

    function send(command) {
        vscode.postMessage({ command: command });
    }
</script>
</body>
</html>
`;
}

/* =========================
   ESP32 COMMANDS
========================= */

async function selectPort() {
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine("ESP32: Searching for ports...");
    outputChannel.appendLine("");

    const ports = await getMpremotePorts();

    const items = [
        {
            label: "auto",
            description: "Automatic port detection"
        },
        ...ports.map((port) => ({
            label: port,
            description: "Detected MicroPython device"
        }))
    ];

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select ESP32 serial port"
    });

    if (!selected) {
        return;
    }

    const config = vscode.workspace.getConfiguration("esp32");

    await config.update(
        "port",
        selected.label,
        vscode.ConfigurationTarget.Global
    );

    vscode.window.showInformationMessage(
        `ESP32 port selected: ${selected.label}`
    );

    outputChannel.appendLine("");
    outputChannel.appendLine(`Selected port: ${selected.label}`);
}

async function checkPorts() {
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine("ESP32: Checking ports...");
    outputChannel.appendLine("");

    await runPythonToOutput([
        "-m",
        "mpremote",
        "devs"
    ]);
}

async function uploadPermanent() {
    const filePath = await getCurrentFilePath();

    if (!filePath) {
        return;
    }

    const config = vscode.workspace.getConfiguration("esp32");
    const permanentFileName = config.get("permanentFileName", "main.py");
    const autoReset = config.get("autoResetAfterUpload", true);

    const remotePath = `:/${permanentFileName}`;

    await runMpremoteTask(
        `ESP32 Upload Permanent ${permanentFileName}`,
        [
            "fs",
            "cp",
            filePath,
            remotePath
        ],
        true
    );

    if (autoReset) {
        setTimeout(() => {
            resetBoard();
        }, 1200);
    }
}

async function runTemporary() {
    const filePath = await getCurrentFilePath();

    if (!filePath) {
        return;
    }

    await runMpremoteTask(
        `ESP32 Run Temporary ${path.basename(filePath)}`,
        [
            "run",
            filePath
        ],
        false
    );
}

async function resetBoard() {
    await runMpremoteTask(
        "ESP32 Reset",
        [
            "exec",
            "import machine; machine.reset()"
        ],
        true
    );
}

async function listFiles() {
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine("ESP32: Listing files...");
    outputChannel.appendLine("");

    await runMpremoteToOutput([
        "fs",
        "ls",
        ":"
    ]);
}

async function stopPermanent() {
    const config = vscode.workspace.getConfiguration("esp32");
    const permanentFileName = config.get("permanentFileName", "main.py");
    const remotePath = `:/${permanentFileName}`;

    const answer = await vscode.window.showWarningMessage(
        `Stop Permanent will delete /${permanentFileName} from ESP32, then reset the board. Continue?`,
        "Delete and Reset",
        "Cancel"
    );

    if (answer !== "Delete and Reset") {
        return;
    }

    await runMpremoteTask(
        "ESP32 Delete Permanent File",
        [
            "fs",
            "rm",
            remotePath
        ],
        true
    );

    setTimeout(() => {
        resetBoard();
    }, 1200);
}

async function monitorBoard() {
    await runMpremoteTask(
        "ESP32 Monitor",
        [
            "repl"
        ],
        false
    );
}

/* =========================
   HELPERS
========================= */

async function getCurrentFilePath() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage("No file is open.");
        return null;
    }

    const document = editor.document;

    if (document.isUntitled) {
        vscode.window.showErrorMessage("Save the file first.");
        return null;
    }

    if (document.isDirty) {
        await document.save();
    }

    if (!document.fileName.toLowerCase().endsWith(".py")) {
        const answer = await vscode.window.showWarningMessage(
            "This file is not a Python file. Continue?",
            "Continue",
            "Cancel"
        );

        if (answer !== "Continue") {
            return null;
        }
    }

    return document.fileName;
}

async function runMpremoteTask(taskName, mpremoteArgs, autoCloseTerminal) {
    const config = vscode.workspace.getConfiguration("esp32");

    const pythonCommand = config.get("pythonCommand", "python");
    const port = config.get("port", "auto");

    const args = [
        "-m",
        "mpremote",
        "connect",
        port,
        ...mpremoteArgs
    ];

    const task = new vscode.Task(
        {
            type: "esp32-micropython",
            task: taskName
        },
        vscode.TaskScope.Workspace,
        taskName,
        "ESP32",
        new vscode.ProcessExecution(pythonCommand, args),
        []
    );

    task.presentationOptions = {
        reveal: vscode.TaskRevealKind.Always,
        focus: taskName === "ESP32 Monitor",
        panel: vscode.TaskPanelKind.Dedicated,
        clear: true,
        close: autoCloseTerminal
    };

    try {
        const execution = await vscode.tasks.executeTask(task);
        ownedExecutions.add(execution);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to run ESP32 command: ${error.message}`);
    }
}

function runMpremoteToOutput(mpremoteArgs) {
    const config = vscode.workspace.getConfiguration("esp32");
    const port = config.get("port", "auto");

    const args = [
        "-m",
        "mpremote",
        "connect",
        port,
        ...mpremoteArgs
    ];

    return runPythonToOutput(args);
}

function runPythonToOutput(args) {
    return new Promise((resolve) => {
        const config = vscode.workspace.getConfiguration("esp32");
        const pythonCommand = config.get("pythonCommand", "python");

        outputChannel.appendLine(`> ${pythonCommand} ${args.join(" ")}`);
        outputChannel.appendLine("");

        const child = cp.spawn(pythonCommand, args, {
            shell: false
        });

        child.stdout.on("data", (data) => {
            outputChannel.append(data.toString());
        });

        child.stderr.on("data", (data) => {
            outputChannel.append(data.toString());
        });

        child.on("error", (error) => {
            outputChannel.appendLine("");
            outputChannel.appendLine(`Error: ${error.message}`);
            vscode.window.showErrorMessage(
                "Failed to run command. Check Python and mpremote installation."
            );
            resolve();
        });

        child.on("close", (code) => {
            outputChannel.appendLine("");
            outputChannel.appendLine(`Finished with exit code: ${code}`);

            if (code === 0) {
                vscode.window.setStatusBarMessage("ESP32 command finished", 3000);
            } else {
                vscode.window.showErrorMessage(`ESP32 command failed. Exit code: ${code}`);
            }

            resolve();
        });
    });
}

function getMpremotePorts() {
    return new Promise((resolve) => {
        const config = vscode.workspace.getConfiguration("esp32");
        const pythonCommand = config.get("pythonCommand", "python");

        const child = cp.spawn(
            pythonCommand,
            ["-m", "mpremote", "devs"],
            {
                shell: false
            }
        );

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("error", (error) => {
            outputChannel.appendLine(`Error: ${error.message}`);
            vscode.window.showErrorMessage(
                "Failed to check ports. Make sure Python and mpremote are installed."
            );
            resolve([]);
        });

        child.on("close", () => {
            outputChannel.append(stdout);

            if (stderr.trim()) {
                outputChannel.appendLine(stderr);
            }

            const ports = parseMpremotePorts(stdout);

            if (ports.length === 0) {
                vscode.window.showWarningMessage(
                    "No ESP32 ports found. You can still choose auto."
                );
            }

            resolve(ports);
        });
    });
}

function parseMpremotePorts(text) {
    const ports = [];

    const lines = text.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        const windowsMatch = trimmed.match(/\bCOM\d+\b/i);
        if (windowsMatch) {
            ports.push(windowsMatch[0].toUpperCase());
            continue;
        }

        const linuxMatch = trimmed.match(/\/dev\/tty[A-Za-z0-9._-]+/);
        if (linuxMatch) {
            ports.push(linuxMatch[0]);
            continue;
        }

        const macMatch = trimmed.match(/\/dev\/cu\.[A-Za-z0-9._-]+/);
        if (macMatch) {
            ports.push(macMatch[0]);
            continue;
        }

        const macTtyMatch = trimmed.match(/\/dev\/tty\.[A-Za-z0-9._-]+/);
        if (macTtyMatch) {
            ports.push(macTtyMatch[0]);
            continue;
        }
    }

    return [...new Set(ports)];
}

function closeEsp32TaskTerminals() {
    for (const terminal of vscode.window.terminals) {
        const name = terminal.name.toLowerCase();

        if (
            name.includes("esp32") ||
            name.includes("micropython") ||
            name.includes("mpremote") ||
            name.includes("upload permanent") ||
            name.includes("run temporary") ||
            name.includes("delete permanent")
        ) {
            terminal.dispose();
        }
    }

    vscode.window.setStatusBarMessage("ESP32 terminals closed", 1500);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};