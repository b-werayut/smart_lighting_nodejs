const prisma = require("../config/prisma")
const { v4: uuidv4 } = require('uuid')

exports.insertDatas = async (datas) => {
    try {
        const { meshname, macAddress, rssi, mode, workMode, subdevices, ip, datetime, uptime, last_time_sync } = datas
        const meshGroupName = meshname

        let meshGroup = await prisma.meshGroup.findFirst({
            where: { name: meshGroupName },
        })

        if (!meshGroup) {
            const newMeshGroup = await prisma.meshGroup.create({
                data: {
                    name: meshGroupName,
                    devices: {
                        create: {
                            // macAddress: `${macAddress}${uuidv4().replace(/-/g, '').substring(0, 6)}`,
                            macAddress: `${macAddress}`,
                            rssi,
                            mode,
                            workMode,
                            ip,
                            datetime,
                            uptime,
                            last_time_sync
                        },
                    },
                },
            })

            const newMainDevice = await prisma.devices.create({
                data: {
                    // macAddress: `${macAddress}-${uuidv4().replace(/-/g, '').substring(0, 6)}`,
                    macAddress: `${macAddress}`,
                    rssi,
                    mode,
                    workMode,
                    ip,
                    datetime,
                    uptime,
                    last_time_sync,
                    meshGroupId: meshGroup.id,
                }
            })
            console.log('Insert MainDevice to db: ', newMainDevice)
            return newMainDevice
        }
        console.log('MainDevice in db: ', meshGroup)
        return meshGroup


    } catch (err) {
        console.error('Error inserting data:', err.message)
    }
}

exports.insertSubDevices = async (mac, subdevices) => {
    try {
        const mainDevices = await prisma.mainDevices.findFirst({
            where: { macAddress: mac },
        })

        const subDevices = await prisma.subDevices.findFirst({
            where: { macAddress: subdevices },
        })

        if (!subDevices) {
            const insertSubDevices = await prisma.subDevices.create({
                data: {
                    macAddress: subdevices,
                    mainDeviceId: mainDevices.id,
                }
            })
            console.log('Insert Sub device to db: ', subDevices)
            return insertSubDevices
        }
        console.log('Sub device in db: ', subDevices)
        return subDevices

    } catch (err) {
        console.log(err)
    }
}