const mqtt = require('mqtt')
const { v4: uuidv4 } = require('uuid')
const { insertDevices } = require('./database_manage')


const mqttserver = process.env.MQTT_SERVER
const topic = ["mesh_data/toCloud/56/+", "mesh_data/toCloud/66/+", "mesh_data/toCloud/255/+", "mesh_data/toCloud/88/+", "mesh_data/toCloud/99/+",]
const options = {
  username: '',
  password: '',
  clientId: 'mqtt-client-' + uuidv4(),
  clean: false,
  connectTimeout: 5000,
}

const client = mqtt.connect(mqttserver, options)

const messageQueue = []
const BATCH_SIZE = 10
const PROCESS_INTERVAL = 5000

client.on('connect', () => {
  console.log('✅ MQTT connected')
  client.subscribe(topic, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ MQTT Subscribe Error:', err.message)
    } else {
      console.log(`✅ Subscribed Success `)
    }
  })
})

client.on('message', async (_, mqttMessage) => {
  try {
    const data = JSON.parse(mqttMessage.toString())

    if (!data?.mesh?.mac || !data?.mesh?.timestamp) {
      console.warn('⚠️ Incomplete data, skipping...')
      return
    }

    const {
      mac,
      tag,
      tree_topology: subdevices,
      rssi,
      mesh_mode,
      ip,
      lat,
      lng,
      layer,
      datetime,
      timestamp,
      uptime,
      last_time_sync,
      mid
    } = data.mesh || {}

    const {
      workmode,
      lightmode,
      relay,
      pwm_freq,
      pwm1,
      pwm2,
    } = data.lighting || {}

    const {
      current
    } = data.sensor || {}

    const scheduleListSunday = data.schedule?.sunday?.list ?? "No Array Data!"
    const scheduleListMonday = data.schedule?.monday?.list
    const scheduleListTuesday = data.schedule?.tuesday?.list
    const scheduleListWednesday = data.schedule?.wednesday?.list
    const scheduleListThursday = data.schedule?.thursday?.list
    const scheduleListFriday = data.schedule?.friday?.list
    const scheduleListSaturday = data.schedule?.saturday?.list
    
        const formattedData = {
          macAddress: mac,
          tag,
          rssi: String(rssi),
          mesh_mode,
          ip,
          lat,
          lng,
          layer,
          datetime: String(datetime),
          timestamp: String(timestamp),
          uptime,
          last_time_sync: String(last_time_sync),
          workmode,
          pwm_freq,
          pwm1,
          pwm2,
          lightmode: String(lightmode),
          relay: String(relay),
          mid: String(mid),
          current,
          schListSunday: scheduleListSunday,
          // schListMonday: scheduleListMonday,
          // schListTuesday: scheduleListTuesday,
          // schListWednesday: scheduleListWednesday,
          // schListThursday: scheduleListThursday,
          // schListFriday: scheduleListFriday,
          // schListSaturday: scheduleListSaturday,
        }

        messageQueue.push(formattedData)

  } catch (err) {
    console.error('❌ Parse Error:', err.message)
  }
})

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message)
})

setInterval(async () => {
  if (messageQueue.length === 0) return

  const batch = messageQueue.splice(0, BATCH_SIZE) //ดึงข้อมูลจาก array ตามจำนวน BATCH_SIZE

  try {
    for (const data of batch) {
      console.log('📥 Inserting :', data)
      //await insertDevices(data) // insert ทีละตัวแบบ รอจนครบก่อน
      await Promise.all(batch.map(data => insertDevices(data))) // insert พร้อมกันทั้งหมด (ไวกว่า)
    }
    // console.log(`✅ Inserted (${batch.length}) Devices Datas`)
  } catch (err) {
    console.error('❌ DB Insert Error:', err.message)
  }
}, PROCESS_INTERVAL)

module.exports = client
