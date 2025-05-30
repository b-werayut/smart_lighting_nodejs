const config = require("dotenv").config()
const client = require('./mqtt_connect')
const { insertDatas } = require('./database_manage')
const processedMacs = new Set()

exports.turnOnLight = async (req, res) => {
    try {
        const topic = 'mesh_data/toDevice/56';
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'ON',
                workmode: 'MANUAL',
                lightmode: 'PWM',
                pwm1: 0,
                pwm2: 40,
            },
        });

        if (!client.connected) {
            console.log('MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        setTimeout(() => {
            client.publish(topic, message, { qos: 1, retain: true }, (err) => {
                if (err) {
                    console.error('❌ Publish error:', err.message);
                    if (!res.headersSent) res.status(500).send('Publish failed');
                } else {
                    console.log(`📤 Sent to topic "${topic}": ${message}`);
                    if (!res.headersSent) res.send(`📤 Sent to topic "${topic}": ${message}`);
                }
            });
        }, 2000);

    } catch (err) {
        console.error('❌ Server Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' });
    }
};


exports.turnOffLight = async (req, res) => {
    try {
        const topic = 'mesh_data/toDevice/56';
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'OFF',
                workmode: 'MANUAL',
                lightmode: 'PWM',
                pwm1: 20,
                pwm2: 0,
            },
        });

        if (!client.connected) {
            console.log('MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        setTimeout(() => {
            client.publish(topic, message, { qos: 1, retain: true }, (err) => {
                if (err) {
                    console.error('❌ Publish error:', err.message);
                    if (!res.headersSent) res.status(500).send('Publish failed');
                } else {
                    console.log(`📤 Sent to topic "${topic}": ${message}`);
                    if (!res.headersSent) res.send(`📤 Sent to topic "${topic}": ${message}`);
                }
            });
        }, 2000);

    } catch (err) {
        console.error('❌ Server Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' });
    }
};


exports.deviceResp = async (req, res) => {
    try {
        const mid = 56
        const macList = ['D83BDAA88B8D']
        const message = {
            method: "getInformation",
            params: {}
        }

        if (!client.connected) {
            console.log('❌ MQTT not connected')
            return res.status(500).send('MQTT not connected')
        }

        const responseTopics = macList.map(mac => `mesh_data/toCloud/${mid}/${mac}`)
        const expectedResponses = new Set(responseTopics)
        const results = []

        const timeout = setTimeout(() => {
            client.removeListener('message', messageHandler)
            console.warn('⚠️ Timeout waiting for some device responses')
            if (!res.headersSent) res.json({
                message: 'Partial or Timeout',
                received: results,
                pending: Array.from(expectedResponses)
            })
        }, 7000)

        const messageHandler = (receivedTopic, mqttMessage) => {
            if (expectedResponses.has(receivedTopic)) {
                try {
                    const data = JSON.parse(mqttMessage.toString())
                    const mac = data.mesh?.mac
                    const rssi = data.mesh?.rssi
                    const mode = data.mesh?.mesh_mode
                    const mid = data.mesh?.mid

                    console.log(`✅ Response from ${mac}: rssi=${rssi}, mode=${mode}`)

                    results.push({ mac, mid, rssi, mode })
                    expectedResponses.delete(receivedTopic)

                    if (expectedResponses.size === 0) {
                        clearTimeout(timeout)
                        client.removeListener('message', messageHandler)
                        if (!res.headersSent) res.json({ message: 'All devices responded', results })
                    }
                } catch (err) {
                    console.error('❌ Parse error:', err)
                }
            }
        }

        client.subscribe(responseTopics, { qos: 1 }, (err) => {
            if (err) {
                console.error('❌ Subscription failed:', err.message)
                return res.status(500).send('Failed to subscribe')
            }

            console.log(`📡 Subscribed to topics:`, responseTopics)
            client.on('message', messageHandler)

            const payload = JSON.stringify(message)
            macList.forEach(mac => {
                const topic = `mesh_data/toDevice/${mid}/${mac}`
                client.publish(topic, payload, { qos: 1, retain: false }, (err) => {
                    if (err) {
                        console.error(`❌ Failed to publish to ${mac}:`, err.message)
                    } else {
                        console.log(`📤 Sent to ${mac}`)
                    }
                })
            })
        })

    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.getMidDatas = async (req, res) => {
    try {
        if (!client.connected) return res.status(500).send('MQTT not connected')

        // const topic = 'mesh_data/toCloud/58/+'
        const { topic } = req.body
        console.log('topic:::::', topic)
        const meshNameraw = topic.split('/')
        const meshName = meshNameraw[2]
        let responded = false

        if (meshName !== '56') {
            const datastest = {
                meshname: meshName,
                macAddress: 'aaaaaaa',
                rssi: String('8885'),
                mode: 'bbbb',
                workMode: 'sssss',
                ip: '4555',
                datetime: 'bbbb666',
                uptime: '4444',
                last_time_sync: '999'
            }

            const result = await insertDatas(datastest)
            console.log("Insert Datastest to DB::", result)
            return res.json({ message: 'Insert Datastest to DB', data: result });
        }

        client.subscribe(topic, async (err) => {
            if (err) return res.status(500).send('Failed to subscribe to topic')

            const timeout = setTimeout(() => {
                if (!responded) {
                    client.removeListener('message', handler)
                    console.log('No data received from MQTT topic within timeout')
                    res.status(408).send('No data received from MQTT topic within timeout')
                }
            }, 10000)

            const handler = async (_, mqttMessage) => {
                try {
                    const data = JSON.parse(mqttMessage.toString())

                    if (data.mesh?.mid !== 56) return

                    const mac = data.mesh.mac
                    if (processedMacs.has(mac)) return

                    processedMacs.add(mac)
                    setTimeout(() => processedMacs.delete(mac), 10000)

                    const rssi = String(data.mesh.rssi)
                    const mode = data.mesh.mesh_mode
                    const workMode = data.lighting?.workmode
                    const ip = data.mesh?.ip
                    const datetime = String(data.mesh?.datetime)
                    const uptime = data.mesh?.uptime
                    const last_time_sync = String(data.mesh?.last_time_sync)

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
                    }

                    const result = await insertDatas(datas)
                    console.log("Insert Datas to DB::", result)
                    clearTimeout(timeout)
                    responded = true

                    client.removeListener('message', handler)
                    res.send(`✅ meshname: ${meshName}, mac: ${mac}, rssi: ${rssi}, mode: ${mode}, workmode: ${workMode}`)
                } catch (err) {
                    console.error('Parse Error:', err)
                }
            }

            client.on('message', handler)
        })
    } catch (err) {
        console.error('Server Error:', err)
        if (!res.headersSent) res.status(500).send('Server Error')
    }
}


exports.scheduleLight = async (req, res) => {
    try {
        const topic = 'mesh_data/toDevice/56'
        const message = ({
            "method": "config_lighting",
            "params": {
                "pwm_freq ": 500,
                "pwm1_min_params": 0,
                "pwm1_max_params": 4096,
                "pwm2_min_params": 0,
                "pwm2_max_params": 4096,
                "pwm1_lux_error": 0,
                "pwm2_lux_error ": 0,
            }
        }
        )

    } catch (err) {
        console.log('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}