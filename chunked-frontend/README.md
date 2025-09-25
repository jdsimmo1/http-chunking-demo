# Running
**setup**
1. cd into chunked-api
2. `python -m venv .dev`
3. `source .dev/lib/activate` (MacOS) or `.dev\scripts\activate` (Windows)
4. `pip install -r requirements.txt`

5. cd into chunked-frontend
6. `npm i`

**running**

Within the appropriate dirs:
1. `python app.py`
2. `ng serve`

# How?
The usual way:
```
Content-Length: XXXXXX
```

Using Chunks:
```
Transfer-Encoding: chunked
```

(Per [Mozzilla](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Trailer))
You can also append information to the final chunk that was not in any prior message using:
```
Trailer: header-names
```

The following header names are **disallowed**:
- [`Content-Encoding`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding), [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type), [`Content-Range`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Range), and `Trailer`
- Authentication headers (e.g., [`Authorization`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Authorization) or [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie))
- Message framing headers (e.g., [`Transfer-Encoding`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Transfer-Encoding) and [`Content-Length`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length))
- Routing headers (e.g., [`Host`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Host))
- Request modifiers (e.g., controls and conditionals, like [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control), [`Max-Forwards`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Max-Forwards), or [`TE`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/TE))

# HTTP/1.1
Chunked streaming only works for HTTP/1.1, HTTP/2 and HTTP/3 do not allow for this protocol and have multiple other ways of handling this problem.

No possible way to show "X out of Y bytes", true progress display/information is entirely limited to number of chunks.

### Websockets?
Different protocol (RFC 6455) which may require network security considerations.

Two-way communication via TCP

No headers

More complex states and state management

Manual connection closing / connection pooling