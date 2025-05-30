const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

const mqttserver = process.env.MQTT_SERVER

const options = {
    username: '',
    password: '',
    clientId: 'mqtt-client-' + uuidv4(),
    clean: false,
};

const client = mqtt.connect(mqttserver, options);

client.on('connect', (e) => {
  console.log('✅ MQTT connected')
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message)
});

module.exports = client;