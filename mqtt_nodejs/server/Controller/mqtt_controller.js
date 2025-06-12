const config = require("dotenv").config()
const client = require('./mqtt_connect')
const { insertMainDevices, insertSubDevices } = require('./database_manage')

exports.turnOnLight = async (req, res) => {
    try {
        const { macAddress } = req.body
        console.log('macAddressReq', macAddress)
        if (!macAddress) {
            return res.status(400).json({ msg: 'macAddress is required' });
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`;
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
            console.warn('⚠️ MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message);
                if (!res.headersSent) res.status(500).send('Publish failed');
            } else {
                console.log(`📤 Published to "${topic}": ${message}`);
                if (!res.headersSent) res.json({ status: 'ON' });
            }
        });

    } catch (err) {
        console.error('❌ Server Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' });
    }
};

exports.turnOffLight = async (req, res) => {
    try {
        const { macAddress } = req.body
        console.log('macAddressReq', macAddress)
        if (!macAddress) {
            return res.status(400).json({ msg: 'macAddress is required' });
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`;
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'OFF',
                workmode: 'MANUAL',
                lightmode: 'PWM',
                pwm1: 0,
                pwm2: 40,
            },
        });

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message);
                if (!res.headersSent) res.status(500).send('Publish failed');
            } else {
                console.log(`📤 Published to "${topic}": ${message}`);
                if (!res.headersSent) res.json({ status: 'OFF' });
            }
        });

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

exports.getMidDatas = async (req, res,) => {
    try {
        if (!client.connected) return res.status(500).send('MQTT not connected')

        const topic = "mesh_data/toCloud/56/+"
        // const topic = "mesh_data/toCloud/56/D83BDAA88B8D"
        // const { topic } = req.body
        console.log('topic getMidDatas', topic)

        let responded = false

        const processedMacs = new Set();

        client.subscribe(topic, async (err) => {
            if (err) return res.status(500).send('Failed to subscribe to topic')

            const timeout = setTimeout(() => {
                if (!responded && !res.headersSent) {
                    client.removeListener('message', handler)
                    console.log('No data received from MQTT topic within timeout')
                    res.status(408).send('No data received from MQTT topic within timeout')
                }
            }, 10000)

            let datasMainDevices = ''
            let datasSubDevices = ''
            const handler = async (_, mqttMessage) => {
                if (responded) return;

                try {
                    const data = JSON.parse(mqttMessage.toString());
                    // console.log('Received MQTT message:', mqttMessage.toString());

                    if (data.mesh?.mid !== 56) return;

                    const mac = data.mesh?.mac;
                    const rssi = String(data.mesh.rssi);
                    const mode = data.mesh.mesh_mode;
                    const workMode = data.lighting?.workmode;
                    const parent = data.mesh?.parent
                    const ip = data.mesh?.ip;
                    const tree_topology = data.mesh?.tree_topology;
                    const datetime = String(data.mesh?.datetime);
                    const uptime = data.mesh?.uptime;
                    const last_time_sync = String(data.mesh?.last_time_sync);

                    if (processedMacs.has(mac)) return;

                    // if (!tree_topology || tree_topology.length === 0) {
                    //     console.log('Subdevices is empty. Will wait 3 seconds before retrying...');

                    //     // ตั้งเวลาเฉย ๆ ไม่ทำอะไรเพิ่มเติม เพราะ client.on('message', handler) ยังคงทำงานอยู่
                    //     setTimeout(() => {
                    //         console.log('Still waiting for valid subdevices from MQTT...');

                    //     }, 3000);

                    //     return;
                    // }

                    processedMacs.add(mac);
                    setTimeout(() => processedMacs.delete(mac), 10000);

                    clearTimeout(timeout);
                    responded = true;

                    client.removeListener('message', handler);
                    if (!res.headersSent) {
                        res.send(`✅ mac: ${mac}, tree_topology: ${tree_topology.length}, rssi: ${rssi}, mode: ${mode}, workmode: ${workMode}`);
                    }


                    if (mode === "ROOT") {
                        console.log("Mode: ROOT")
                        if (tree_topology && tree_topology.length !== 0) {
                            datasMainDevices = {
                                macAddress: mac,
                                rssi,
                                mode,
                                workMode,
                                tree_topology,
                                parent,
                                ip,
                                datetime,
                                uptime,
                                last_time_sync
                            };
                            console.log('Data to insertMainDevices', datasMainDevices)
                            const maindevice = await insertMainDevices(datasMainDevices)
                        }
                    }

                    if (mode === "NODE") {
                        console.log("Mode: NODE")
                            datasSubDevices = {
                                macAddress: mac,
                                rssi,
                                mode,
                                workMode,
                                parent,
                                ip,
                                datetime,
                                uptime,
                                last_time_sync
                            }
                            console.log('Data to insertMainDevices', datasSubDevices)
                            const subdevice = await insertSubDevices(datasSubDevices)
                    }

                } catch (err) {
                    console.error('Parse Error:', err);
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