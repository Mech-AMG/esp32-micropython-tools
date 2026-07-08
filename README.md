# ESP32 MicroPython Tools

A global Visual Studio Code extension for ESP32 MicroPython development.

This extension adds an ESP32 tool panel in the VS Code Activity Bar and provides quick buttons for common MicroPython tasks using `mpremote`.

## Features

The extension provides these commands:

- **ESP32: Check Ports**
- **ESP32: Upload Permanent**
- **ESP32: Run Temporary**
- **ESP32: Reset**
- **ESP32: List Files**
- **ESP32: Stop Permanent**
- **ESP32: Monitor**
- **ESP32: Close ESP32 Terminals**

## Sidebar Panel

After installation, an ESP32 icon appears in the VS Code Activity Bar.

Click the ESP32 icon to open the MicroPython Tools panel.

Available buttons:

| Button | Function |
|---|---|
| Check Ports | Shows available MicroPython serial ports |
| Upload Permanent | Uploads the current Python file to ESP32 as `/main.py` |
| Run Temporary | Runs the current Python file without saving it permanently |
| Reset ESP32 | Resets the ESP32 board |
| List Files | Lists files stored on the ESP32 filesystem |
| Stop Permanent | Deletes `/main.py` from ESP32 and resets the board |
| Monitor | Opens the MicroPython REPL monitor |
| Close ESP32 Terminals | Closes all ESP32/terminal tabs |

## Important Behavior

When any sidebar button is clicked, the extension first closes all open terminals, waits briefly, and then runs the selected command.

This helps release the COM port before running a new ESP32 command.

## Requirements

Install Python first.

Then install `mpremote`:

```bash
pip install mpremote