const config = require("dotenv").config()
const client = require('./mqtt_connect')
const { insertMainDevices, insertSubDevices } = require('./database_manage')


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.turnOnLight = async (req, res) => {
    try {
        const { macAddress } = req.body
        if (!macAddress) {
            return res.status(400).json({ msg: 'macAddress is required' })
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'ON',
                lightmode: 'PWM'
            },
        })

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected')
            return res.status(503).send('MQTT not connected')
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                if (!res.headersSent) res.status(500).send('Publish failed')
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                if (!res.headersSent) res.json({ status: 'ON' })
            }
        })

    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.turnOnAllLight = async (req, res) => {
    try {

        const topic = `mesh_data/toDevice/56`
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'ON',
                lightmode: 'PWM'
            },
        })

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected')
            return res.status(503).send('MQTT not connected')
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                if (!res.headersSent) res.status(500).send('Failed')
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                if (!res.headersSent) res.json({ status: 'Success' })
            }
        })

    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.turnOffAllLight = async (req, res) => {
    try {

        const topic = `mesh_data/toDevice/56`
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'OFF',
                lightmode: 'PWM'
            },
        })

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected')
            return res.status(503).send('MQTT not connected')
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                if (!res.headersSent) res.status(500).send('Failed')
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                if (!res.headersSent) res.json({ status: 'Success' })
            }
        })

    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.turnOnAllLightVal = async (req, res) => {
    try {
        const { relay, warmVal, coolVal, group } = req.body;

        if (relay === undefined || warmVal === undefined || coolVal === undefined) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        const groupStr = String(group ?? '0');
        const topic = groupStr === '0'
            ? 'mesh_data/toDevice/'
            : `mesh_data/toDevice/${groupStr}`;

        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: String(relay),
                workmode: "MANUAL",
                lightmode: 'PWM',
                pwm1: Number(warmVal),
                pwm2: Number(coolVal),
            },
        });

        if (!client || !client.connected) {
            console.warn('⚠️ MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message);
                if (!res.headersSent) res.status(500).send('Failed');
            } else {
                console.log(`📤 Published to "${topic}": ${message}`);
                if (!res.headersSent) res.json({ status: 'Success' });
            }
        });

    } catch (err) {
        console.error('❌ Server Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' });
    }
}

exports.turnOnLightVal = async (req, res) => {
    try {
        const { macAddress, relay, warmVal, coolVal } = req.body
        if (!macAddress) {
            return res.status(400).json({ msg: 'macAddress is required' })
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`
        const message = JSON.stringify(
            {
                method: 'control_lighting',
                params: {
                    relay,
                    pwm1: Number(warmVal),
                    pwm2: Number(coolVal),
                },
            }
        )

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected')
            return res.status(503).send('MQTT not connected')
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                if (!res.headersSent) res.status(500).send('Publish failed')
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                if (!res.headersSent) res.json({ message })
            }
        })

    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.turnOffLight = async (req, res) => {
    try {
        const { macAddress } = req.body
        if (!macAddress) {
            return res.status(400).json({ msg: 'macAddress is required' })
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                relay: 'OFF'
            },
        })

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected')
            return res.status(503).send('MQTT not connected')
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                if (!res.headersSent) res.status(500).send('Publish failed')
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                if (!res.headersSent) res.json({ status: 'OFF' })
            }
        })

    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}


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

        const processedMacs = new Set()

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
                if (responded) return

                try {
                    const data = JSON.parse(mqttMessage.toString())
                    // console.log('Received MQTT message:', mqttMessage.toString())

                    if (data.mesh?.mid !== 56) return

                    const mac = data.mesh?.mac
                    const rssi = String(data.mesh.rssi)
                    const mode = data.mesh.mesh_mode
                    const workMode = data.lighting?.workmode
                    const parent = data.mesh?.parent
                    const ip = data.mesh?.ip
                    const tree_topology = data.mesh?.tree_topology
                    const datetime = String(data.mesh?.datetime)
                    const uptime = data.mesh?.uptime
                    const last_time_sync = String(data.mesh?.last_time_sync)

                    if (processedMacs.has(mac)) return

                    // if (!tree_topology || tree_topology.length === 0) {
                    //     console.log('Subdevices is empty. Will wait 3 seconds before retrying...')

                    //     // ตั้งเวลาเฉย ๆ ไม่ทำอะไรเพิ่มเติม เพราะ client.on('message', handler) ยังคงทำงานอยู่
                    //     setTimeout(() => {
                    //         console.log('Still waiting for valid subdevices from MQTT...')

                    //     }, 3000)

                    //     return
                    // }

                    processedMacs.add(mac)
                    setTimeout(() => processedMacs.delete(mac), 10000)

                    clearTimeout(timeout)
                    responded = true

                    client.removeListener('message', handler)
                    if (!res.headersSent) {
                        res.send(`✅ mac: ${mac}, tree_topology: ${tree_topology.length}, rssi: ${rssi}, mode: ${mode}, workmode: ${workMode}`)
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
                            }
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

exports.setScheduleLight = async (req, res) => {
    try {
        const datas = req.body;

        if (!Array.isArray(datas?.schedule)) {
            return res.status(400).json({ msg: 'Invalid request format, expected an array' });
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            res.json({ status: datas, published: datas?.schedule.length })
        }

        const macAddress = datas?.macAddress ?? "";
        if (!macAddress || macAddress === "") {
            return res.status(400).json({ msg: 'Missing macAddress' });
        }

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`
        const messageSetschedule = JSON.stringify({
            method: "control_lighting",
            params: {
                workmode: "SCHEDULE",
                lightmode: "PWM",
            }
        })

        client.publish(topic, messageSetschedule, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                return res.status(503).send(" Publish error:")
            } else {
                console.log(`📤 Published to "${topic}": ${messageSetschedule}`)
            }
        })
        await new Promise(resolve => setTimeout(resolve, 5000));

        for (const [index, items] of datas.schedule.entries()) {
            const message = JSON.stringify({
                method: "config_schedule_profile",
                params: {
                    dayofweek: "all",
                    active: items.active ?? false,
                    no: Number(items.no),
                    start_time: items.starttime ?? "00:00",
                    end_time: items.endtime ?? "00:00",
                    pwm1: isNaN(Number(items.warmval)) ? 0 : Number(items.warmval),
                    pwm2: isNaN(Number(items.coolval)) ? 0 : Number(items.coolval),
                    lightmode: "PWM"
                }
            })

            await new Promise((resolve, reject) => {
                client.publish(topic, message, { qos: 1, retain: true }, (err) => {
                    if (err) {
                        console.error('❌ Publish error:', err.message)
                        return reject(err);
                    } else {
                        console.log(`📤 Published to "${topic}": ${message}`)
                        resolve();
                    }
                })
            })

            if (index < datas.schedule.length - 1) {
                await delay(10000)
            }
        }

    } catch (err) {
        console.log('❌ Server Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.setAllScheduleLight = async (req, res) => {
    try {
        const datas = req.body;
        const group = datas?.group;

        if (!Array.isArray(datas?.schedule)) {
            return res.status(400).json({ msg: 'Invalid request format, expected an array' });
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            res.json({ status: datas, published: datas?.schedule.length })
        }

        if (!group) {
            return res.status(400).json({ msg: 'Missing group' });
        }

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        const topic = `mesh_data/toDevice/${group}`;
        const messageSetschedule = JSON.stringify({
            method: "control_lighting",
            params: {
                workmode: "SCHEDULE",
                lightmode: "PWM",
            }
        })

        client.publish(topic, messageSetschedule, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                return res.status(503).send(" Publish error:")
            } else {
                console.log(`📤 Published to "${topic}": ${messageSetschedule}`)
            }
        })
        await new Promise(resolve => setTimeout(resolve, 5000));

        for (const [index, items] of datas?.schedule.entries()) {
            const message = JSON.stringify({
                method: "config_schedule_profile",
                params: {
                    dayofweek: "all",
                    active: items.active ?? false,
                    no: Number(items.no),
                    start_time: items.starttime ?? "00:00",
                    end_time: items.endtime ?? "00:00",
                    pwm1: isNaN(Number(items.warmval)) ? 0 : Number(items.warmval),
                    pwm2: isNaN(Number(items.coolval)) ? 0 : Number(items.coolval),
                    lightmode: "PWM"
                }
            })

            await new Promise((resolve, reject) => {
                client.publish(topic, message, { qos: 1, retain: true }, (err) => {
                    if (err) {
                        console.error('❌ Publish error:', err.message)
                        return reject(err);
                    } else {
                        console.log(`📤 PublishedSchedule to "${topic}": ${message}`)
                        resolve();
                    }
                })
            })

            if (index < datas.schedule.length - 1) {
                await delay(10000)
            }
        }

    } catch (err) {
        console.log('❌ Server Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.setAllScheduleMode = async (req, res) => {
    try {

        const { group } = req.body
        const topic = `mesh_data/toDevice/${group}`
        const message = {
            method: "control_lighting",
            params: {
                workmode: "MANUAL",
                lightmode: "PWM",
            }
        }

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected');
            return res.status(503).send('MQTT not connected');
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                return res.status(503).send(" Publish error:")
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                res.json({ status: "Success" })
            }
        })


    } catch (err) {
        console.log('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}

exports.updateModeMqtt = async (req, res) => {
    try {
        const { macAddress, mode } = req.body
        if (!macAddress) {
            return res.status(400).json({ msg: 'macAddress is required' })
        }

        const topic = `mesh_data/toDevice/56/${macAddress}`
        const message = JSON.stringify({
            method: 'control_lighting',
            params: {
                workmode: mode,
                lightmode: "PWM"
            },
        })

        if (!client.connected) {
            console.warn('⚠️ MQTT not connected')
            return res.status(503).send('MQTT not connected')
        }

        client.publish(topic, message, { qos: 1, retain: true }, (err) => {
            if (err) {
                console.error('❌ Publish error:', err.message)
                if (!res.headersSent) res.status(500).send('Publish failed')
                res.json({ msg: "Error" })
            } else {
                console.log(`📤 Published to "${topic}": ${message}`)
                res.json({ msg: "OK" })
            }
        })
    } catch (err) {
        console.error('❌ Server Error:', err)
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error' })
    }
}
