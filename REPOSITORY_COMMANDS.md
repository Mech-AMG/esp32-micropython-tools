# Repository Setup Commands

Use these commands inside your VS Code extension folder.

## 1. Initialize Git

```bash
git init
```

## 2. Add files

```bash
git add .
```

## 3. First commit

```bash
git commit -m "Initial release of ESP32 MicroPython Tools"
```

## 4. Create a new repository on GitHub

Recommended repository name:

```text
esp32-micropython-tools
```

Do not initialize it with README, LICENSE, or .gitignore because these files already exist locally.

## 5. Connect local project to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/esp32-micropython-tools.git
git push -u origin main
```

## 6. Add repository to package.json

Add or update this part in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/esp32-micropython-tools.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/esp32-micropython-tools/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/esp32-micropython-tools#readme",
  "license": "MIT",
  "icon": "icon.png"
}
```

## 7. Package again

```bash
npx @vscode/vsce package
```

## 8. Publish

```bash
npx @vscode/vsce publish
```
