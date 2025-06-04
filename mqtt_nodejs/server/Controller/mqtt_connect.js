const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid')
const { insertDatas, insertSubDevices } = require('./database_manage')

const mqttserver = process.env.MQTT_SERVER
const topic = "mesh_data/toCloud/56/+"
// const topic = "mesh_data/toDevice/56/+"
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

const meshNameraw = topic.split('/')
const meshName = meshNameraw[2]
let responded = false

client.subscribe(topic, async (err) => {
  if (err) return console.log('subscribe err')

  const handler = async (_, mqttMessage) => {
    if (responded) return;

    try {
      const data = JSON.parse(mqttMessage.toString());

      if (data.mesh?.mid !== 56) return;

      const mac = data.mesh.mac;
      console.log('data:::::::', data)

      const subdevices = data.mesh.tree_topology;

      const rssi = String(data.mesh.rssi);
      const mode = data.mesh.mesh_mode;
      const workMode = data.lighting?.workmode;
      const ip = data.mesh?.ip;
      const datetime = String(data.mesh?.datetime);
      const uptime = data.mesh?.uptime;
      const last_time_sync = String(data.mesh?.last_time_sync);

      const datas = {
        meshname: meshName,
        macAddress: mac,
        rssi,
        mode,
        workMode,
        ip,
        datetime,
        uptime,
        last_time_sync
      };

      const result = await insertDatas(datas)

      await subdevices.map(async (e) => {
        const insert = await insertSubDevices(mac, e)
      })

      // responded = true;


    } catch (err) {
      console.error('Parse Error:', err);
    }
  }
  client.on('message', handler)
})

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message)
});

module.exports = client;