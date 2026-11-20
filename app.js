const brokerUrl = "wss://broker.hivemq.com:8884/mqtt";
const topic = "morimoto0513/iot_try/sensor";

const connectionStatus =
  document.getElementById("connection-status");

const receiveStatus =
  document.getElementById("receive-status");

const luxValue =
  document.getElementById("lux-value");

const brightnessValue =
  document.getElementById("brightness-value");

const levelValue =
  document.getElementById("level-value");

const brightnessFill =
  document.getElementById("brightness-fill");

const buttonValue =
  document.getElementById("button-value");

const timestampValue =
  document.getElementById("timestamp-value");

const message =
  document.getElementById("message");

const clientId =
  "iot_try_web_" +
  Math.random().toString(16).slice(2);

const client = mqtt.connect(brokerUrl, {
  clientId: clientId,
  clean: true,
  connectTimeout: 10000,
  reconnectPeriod: 3000
});

client.on("connect", () => {
  connectionStatus.textContent = "接続済み";
  connectionStatus.className = "status connected";

  message.textContent =
    "MQTTに接続しました。Raspberry Piからのデータを待っています。";

  client.subscribe(topic, (error) => {
    if (error) {
      receiveStatus.textContent = "購読失敗";
      receiveStatus.className = "status disconnected";

      message.textContent =
        "MQTTトピックの購読に失敗しました。";
    }
  });
});

client.on("reconnect", () => {
  connectionStatus.textContent = "再接続中";
  connectionStatus.className = "status waiting";
});

client.on("offline", () => {
  connectionStatus.textContent = "オフライン";
  connectionStatus.className = "status disconnected";
});

client.on("error", (error) => {
  console.error(error);

  connectionStatus.textContent = "エラー";
  connectionStatus.className = "status disconnected";

  message.textContent =
    "MQTT接続エラーが発生しました。";
});

client.on("message", (receivedTopic, payload) => {
  if (receivedTopic !== topic) {
    return;
  }

  try {
    const data = JSON.parse(payload.toString());

    const lux = Number(data.lux);
    const brightness = Number(data.ledBrightness);
    const level = Number(data.ledLevel);
    const buttonPressed = Boolean(data.button);

    luxValue.textContent =
      Number.isFinite(lux) ? lux.toFixed(1) : "--";

    brightnessValue.textContent =
      Number.isFinite(brightness)
        ? brightness.toFixed(0)
        : "--";

    levelValue.textContent =
      Number.isFinite(level) ? level : "--";

    brightnessFill.style.width =
      Number.isFinite(brightness)
        ? `${Math.min(100, Math.max(0, brightness))}%`
        : "0%";

    if (buttonPressed) {
      buttonValue.textContent = "押下中";
      buttonValue.className = "button-state pressed";
    } else {
      buttonValue.textContent = "未押下";
      buttonValue.className = "button-state";
    }

    const receivedTime = new Date();

    timestampValue.textContent =
      receivedTime.toLocaleString("ja-JP");

    receiveStatus.textContent = "受信中";
    receiveStatus.className = "status receiving";

    message.textContent =
      "Raspberry Piからセンサデータを受信しています。";
  } catch (error) {
    console.error(error);

    receiveStatus.textContent = "形式エラー";
    receiveStatus.className = "status disconnected";

    message.textContent =
      "受信データをJSONとして読み取れませんでした。";
  }
});
