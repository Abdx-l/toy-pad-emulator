"""Board adapter boundary. A real adapter must implement send(frame)."""
import argparse
import json
from pathlib import Path


def encode(state):
    slots = state["slots"]
    if len(slots) != 3:
        raise ValueError("expected three slots")
    color = state["led"]["color"]
    rgb = bytes.fromhex(color.removeprefix("#"))
    if len(rgb) != 3:
        raise ValueError("invalid colour")
    effect = {"off": 0, "solid": 1, "pulse": 2}[state["led"]["effect"]]
    tags = b"".join((tag or "").encode("ascii")[:32].ljust(32, b"\x00") for tag in slots)
    return b"PAD1" + bytes([effect]) + rgb + tags


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mock", action="store_true", required=True)
    parser.add_argument("state", type=Path)
    args = parser.parse_args()
    print(encode(json.loads(args.state.read_text())).hex())


if __name__ == "__main__": main()

