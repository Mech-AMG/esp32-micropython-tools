# ESP32 MicroPython Tools

ESP32 MicroPython Tools is a Visual Studio Code extension designed to simplify ESP32 development with MicroPython.

It provides useful commands and workflow shortcuts for students, makers, and embedded systems developers who use ESP32 boards with MicroPython.

## Features

- Run MicroPython files on ESP32
- Stop the current running process
- Close all active terminals before executing extension commands
- Open ESP32-related tools quickly from VS Code
- Improve the development workflow for ESP32 and MicroPython projects

## Requirements

Before using this extension, make sure you have:

- Visual Studio Code
- Python installed and added to PATH
- MicroPython installed on the ESP32 board
- A USB cable connected to the ESP32
- The correct COM port selected

## Usage

Open the Command Palette in VS Code:

```text
Ctrl + Shift + P
```

Then search for:

```text
ESP32
```

Choose the command you want to run.

## Extension Settings

This extension may use settings such as:

```json
{
  "esp32.pythonCommand": "python",
  "esp32.port": "COM3"
}
```

Change `COM3` to match your ESP32 port.

## Known Issues

- The ESP32 must be connected before running upload or serial commands.
- If the port is busy, close all terminals and try again.
- Make sure no other program, such as Thonny or Arduino IDE, is using the same COM port.

## Repository

This project can be hosted on GitHub as an open-source Visual Studio Code extension.

## License

This project is licensed under the MIT License.
