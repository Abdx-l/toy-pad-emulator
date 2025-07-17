# Toy Pad Emulator for Video Game

A local virtual toy pad with three tag slots, LED colour/effect controls, and a browser control panel. State changes stream through Server-Sent Events and persist to a JSON file. A Python bridge reads the same state format and can emit frames to a device adapter. The bundled `--mock` adapter writes frames to stdout.

```sh
node server.js
node --test
python bridge.py --mock state.json
```

Open http://127.0.0.1:8080. `POST /api/slots/0` with `{"tag":"ABC123"}`; `PUT /api/led` with `{"color":"#3366ff","effect":"pulse"}`. The API listens on loopback only. The device adapter boundary accepts the virtual protocol's state frames.

