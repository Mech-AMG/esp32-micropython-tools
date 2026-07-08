# ESP32 MicroPython Tools

ESP32 MicroPython Tools is a Visual Studio Code extension for ESP32 development with MicroPython.

## Features

- Upload MicroPython files to ESP32
- Run temporary MicroPython code
- Stop currently running ESP32 code
- Reset ESP32
- Open serial monitor
- List files on ESP32
- Select and change the ESP32 serial port from VS Code settings

## Requirements

Before using this extension, make sure you have:

- Visual Studio Code
- Python installed
- `mpremote` installed
- ESP32 connected by USB
- MicroPython firmware installed on the ESP32

Install mpremote:

```bash
pip install mpremote
```

## Extension Settings

This extension supports the following settings:

```json
{
  "esp32.port": "COM3",
  "esp32.pythonCommand": "python"
}
```

Change `COM3` to your ESP32 port, for example:

```json
{
  "esp32.port": "COM5"
}
```

For Linux/macOS, use a port like:

```json
{
  "esp32.port": "/dev/ttyUSB0"
}
```

## Usage

Open the Command Palette:

```text
Ctrl + Shift + P
```

Search for:

```text
ESP32
```

Then choose the command you want to run.

## Known Issues

- Make sure Thonny, Arduino IDE, or another serial monitor is not using the same COM port.
- If the port is busy, close all terminals and try again.
- Select the correct port before uploading or running code.

## License

This project is licensed under the MIT License.
