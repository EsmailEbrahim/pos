export class WebSocketPrinter {
    constructor(options) {
        const defaults = {
            url: "ws://127.0.0.1:12212/printer",
            onConnect: function () {},
            onDisconnect: function () {},
            onUpdate: function () {},
        };
        this.settings = Object.assign({}, defaults, options);
        this.websocket = null;
        this.connected = false;
        this.messageQueue = []; // Queue to store messages when WebSocket is not ready

        this.connect();
    }

    onMessage(evt) {
        this.settings.onUpdate(evt.data);
    }

    onConnect() {
        this.connected = true;
        this.settings.onConnect();

        // Send queued messages
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.websocket.send(message);
        }
    }

    onDisconnect() {
        this.connected = false;
        this.settings.onDisconnect();
        this.reconnect();
    }

    onError() {
        alert("Could not establish connection with the printer. Please check if the WebApp Hardware Bridge is running.");
    }

    connect() {
        this.websocket = new WebSocket(this.settings.url);
        this.websocket.onopen = () => this.onConnect();
        this.websocket.onclose = () => this.onDisconnect();
        this.websocket.onmessage = (evt) => this.onMessage(evt);
        this.websocket.onerror = () => this.onError();
    }

    reconnect() {
        setTimeout(() => this.connect(), 3000); // Retry connection after 3 seconds
    }

    submit(data) {
        const formattedData = Array.isArray(data)
            ? data.map((element) => JSON.stringify(element))
            : [JSON.stringify(data)];

        formattedData.forEach((message) => {
            if (this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(message);
            } else {
                console.warn("WebSocket not ready. Queuing message:", message);
                this.messageQueue.push(message);
            }
        });
    }

    isConnected() {
        return this.connected;
    }
}
