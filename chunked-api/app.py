from pathlib import Path
from flask import Flask, Response, jsonify, request, stream_with_context
from flask_cors import CORS
import time
import json


# Created/ran with Python 3.12.10
app = Flask(__name__)
CORS(app)  # allow localhost:4200

@app.get("/regular")
def regular():
    '''
    Content-Length: X
    '''
    # The "content-length" property in most frameworks is already set and handled for you.
    data = {
        "mode": "regular",
        "message": "This is a regular response returned all at once.",
        "timestamp": time.time(),
        "example": [i for i in range(1, 6)]
    }

    return jsonify(data)

@app.get("/chunked")
def chunked():
    '''
    Transfer-Encoding: chunked
    '''
    # Transfer-Encoding and Content-Length can not be sent in the same HTTP message.

    total_chunks = int(request.args.get("chunks", 5))
    delay_ms = int(request.args.get("delay_ms", 700))

    # The global variables of the request go out of scope in streamed generator functions in flask,
    # this allows us to refer to these values and introduce logic / structure to the generator if needed.
    @stream_with_context
    def generate():
        # Send an opening line so the UI shows immediate progress
        # "yield" turns this function into a generator/iterator useful for asynchronous streaming.
        yield _format_chunk({"event": "start", "at": time.time()}, "ndjson")

        for i in range(1, total_chunks + 1):
            time.sleep(delay_ms / 1000.0)

            # Each chunk itself pre-appends a size quantity for the browser to read the chunk itself. 
            # Contents may be arbitrary.

            # <length in hex>\r\n<data>\r\n
            payload = {
                "event": "chunk",
                "index": i,
                "total": total_chunks,
                "data": f"payload-{i}",
                "at": time.time()
            }
            yield _format_chunk(payload, "ndjson")
        # closing signal
        yield _format_chunk({"event": "end", "at": time.time()}, "ndjson")

    # Use text/plain for simple demo & easy incremental rendering
    return Response(generate(), mimetype="text/plain")

@app.get("/stream-file")
def stream_file():
    delay_ms = int(request.args.get("delay_ms", 250))
    filename = "test.txt"
    filepath = Path(filename)

    if not filepath.exists():
        return jsonify({"error": f"file {filename} not found"}), 404

    @stream_with_context
    def generate():
        with filepath.open("r", encoding="utf-8") as f:
            for line in f:
                for word in line.split():
                    yield word + " "
                    time.sleep(delay_ms / 1000.0)
        yield "\n"

    return Response(generate(), mimetype="text/plain")

def _format_chunk(obj, format):
    if format == "text":
        return f"{obj}\n"

    return json.dumps(obj) + "\n"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
