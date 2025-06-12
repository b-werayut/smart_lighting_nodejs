const prisma = require("../Config/prisma")


// exports.insertMainDevices = async (datas) => {
//   try {
//     const {
//       macAddress, rssi, mode, workMode, parent, tree_topology, ip,
//       datetime, uptime, last_time_sync
//     } = datas

//     const existingMainDevice = await prisma.MainDevices.findUnique({
//       where: { macAddress },
//       include: { SubDevices: true }
//     })

//     let MainDevice

//     if (existingMainDevice) {
//       MainDevice = await prisma.MainDevices.update({
//         where: { macAddress },
//         data: {
//           rssi,
//           mode,
//           workMode,
//           parent,
//           ip,
//           datetime,
//           uptime,
//           last_time_sync,
//         },
//         include: { SubDevices: true }
//       })

//       const currentSubMacs = existingMainDevice.SubDevices.map(d => d.macAddress).sort()
//       const newSubMacs = [...tree_topology].sort()

//       const hasChanged = JSON.stringify(currentSubMacs) !== JSON.stringify(newSubMacs)

//       if (hasChanged) {
//         // 🔄 Delete old and recreate only if changed
//         await prisma.subDevice.deleteMany({
//           where: { mainDeviceId: MainDevice.id }
//         })

//         await prisma.subDevice.createMany({
//           data: tree_topology.map(mac => ({
//             macAddress: mac,
//             mainDeviceId: MainDevice.id
//           }))
//         })

//         console.log('SubDevices updated')
//       } else {
//         console.log('SubDevices unchanged, no update needed')
//       }

//     } else {
//       MainDevice = await prisma.MainDevices.create({
//         data: {
//           macAddress,
//           rssi,
//           mode,
//           workMode,
//           parent,
//           ip,
//           datetime,
//           uptime,
//           last_time_sync,
//           SubDevices: {
//             create: tree_topology.map(mac => ({
//               macAddress: mac
//             }))
//           }
//         },
//         include: { SubDevices: true }
//       })

//       console.log("Created new MainDevice and SubDevices:")
//       console.log(MainDevice)
//     }

//     return MainDevice

//   } catch (err) {
//     console.error('Error during upsert:', err.message)
//   } finally {
//     // await prisma.$disconnect()
//   }
// }

// exports.insertSubDevices = async (datas) => {
//   try {
//     const {
//       macAddress, rssi, mode, workMode, ip,
//       datetime, uptime, last_time_sync, parent  
//     } = datas

//     const mainDevice = await prisma.MainDevices.findUnique({
//       where: { macAddress: parent }
//     })

//     if (!mainDevice) {
//       console.log(`MainDevice with macAddress "${parent}" not found.`)
//       return false
//     }

//     const existingSubDevice = await prisma.SubDevices.findUnique({
//       where: { macAddress }
//     })

//     let SubDevice

//     if (existingSubDevice) {
//       SubDevice = await prisma.SubDevices.update({
//         where: { macAddress },
//         data: {
//           rssi,
//           mode,
//           workMode,
//           ip,
//           datetime,
//           uptime,
//           last_time_sync,
//           mainDeviceMacAddress: parent  
//         },
//         include: { MainDevices: true }
//       })

//       console.log("✅ Updated existing SubDevice:", SubDevice)
//     } else {
//       SubDevice = await prisma.SubDevices.create({
//         data: {
//           macAddress,
//           rssi,
//           mode,
//           workMode,
//           ip,
//           datetime,
//           uptime,
//           last_time_sync,
//           mainDeviceMacAddress: parent
//         },
//         include: { MainDevices: true }
//       })
//       console.log("✅ Created new SubDevice:", SubDevice)
//     }

//     return SubDevice

//   } catch (err) {
//     console.error('❌ Error during insert/update of SubDevice:', err.message)
//   } finally {
//     // ปิด Prisma หากจำเป็น
//     // await prisma.$disconnect()
//   }
// }

// exports.insertDevices = async (datas) => {
//   try {

//     const {
//       meshname,
//       macAddress,
//       rssi,
//       mesh_mode,
//       ip,
//       datetime,
//       timestamp,
//       uptime,
//       last_time_sync,
//       workmode,
//       lightmode,
//       relay,
//       mid } = datas

//     const existDevices = await prisma.Devices.findUnique({
//       where: { macAddress }
//     })

//     let Devices
//     if (existDevices) {
//       Devices = await prisma.Devices.update({
//         where: { macAddress },
//         data: {
//           macAddress,
//           rssi,
//           mesh_mode,
//           ip,
//           datetime,
//           timestamp,
//           uptime,
//           last_time_sync,
//           workmode,
//           lightmode,
//           relay,
//           mid
//         },
//       })
//       console.log('✅ Devices updated')
//       console.log(Devices)
//     } else {
//       Devices = await prisma.Devices.create({
//         data: {
//           macAddress,
//           rssi,
//           mesh_mode,
//           ip,
//           datetime,
//           timestamp,
//           uptime,
//           last_time_sync,
//           workmode,
//           lightmode,
//           relay,
//           mid
//         },
//       })
//       console.log('✅ Devices create')
//       console.log(Devices)
//     }

//     return Devices

//   } catch (err) {
//     console.error('insertDevices', err)
//   }
// }

exports.insertDevices = async (data) => {
  try {

    const {
      macAddress,
      tag,
      rssi,
      mesh_mode,
      ip,
      datetime,
      timestamp,
      uptime,
      last_time_sync,
      workmode,
      lightmode,
      relay,
      mid } = data

    const Devices = await prisma.Devices.upsert({
      where: { macAddress },
      update: {
        tag,
        rssi,
        mesh_mode,
        ip,
        datetime,
        timestamp,
        uptime,
        last_time_sync,
        workmode,
        lightmode,
        relay,
        mid
      },
      create: {
        ...data
      },
    })

    console.log('✅ Devices upserted :')
    console.log(Devices)
    return Devices

  } catch (err) {
    console.error('❌ insertDevices error:', err)
  }
}
