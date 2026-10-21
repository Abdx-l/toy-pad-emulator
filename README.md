# Toy Pad Emulator for Video Game

A local virtual toy pad with three tag slots, LED colour/effect controls, and a browser control panel. State changes stream through Server-Sent Events and persist to a JSON file. A Python bridge reads the same state format and can emit frames to a device adapter. The bundled `--mock` adapter writes frames to stdout so the whole workflow is testable without a Raspberry Pi or USB/IP device.

```sh
node server.js
node --test
python bridge.py --mock state.json
```

Open http://127.0.0.1:8080. `POST /api/slots/0` with `{"tag":"ABC123"}`; `PUT /api/led` with `{"color":"#3366ff","effect":"pulse"}`. The API listens on loopback only. This is a virtual protocol with a hardware adapter boundary; it does not claim compatibility with a particular game's proprietary USB protocol or verified Raspberry Pi deployment.

