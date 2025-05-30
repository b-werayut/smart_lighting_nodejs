const prisma = require("../config/prisma")
const { v4: uuidv4 } = require('uuid')

exports.insertDatas = async (datas) => {
    try {
        const { meshname, macAddress, rssi, mode, workMode, ip, datetime, uptime, last_time_sync } = datas
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
                            macAddress: `${macAddress}${uuidv4().replace(/-/g, '').substring(0, 6)}`,
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
            return newMeshGroup
        }

        const newDevice = await prisma.device.create({
            data: {
                macAddress: `${macAddress}-${uuidv4().replace(/-/g, '').substring(0, 6)}`,
                rssi,
                mode,
                workMode,
                ip,
                datetime,
                uptime,
                last_time_sync,
                meshGroupId: meshGroup.id,
            },
        })

        return newDevice

    } catch (err) {
        console.error('Error inserting data:', err.message)
    }
}


