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
      lat,
      lng,
      layer,
      datetime,
      timestamp,
      uptime,
      last_time_sync,
      workmode,
      lightmode,
      relay,
      pwm_freq,
      pwm1,
      pwm2,
      mid,
      schListSunday
    } = data

    const devices = await prisma.Devices.upsert({
      where: { macAddress },
      update: {
        tag,
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
        workmode,
        lightmode,
        relay,
        relay,
        pwm_freq,
        pwm1,
        pwm2,
        mid,
        schPwm11: Number(0),
        schPwm21: Number(0),
        schPwm12: Number(0),
        schPwm22: Number(0),
        schPwm13: Number(0),
        schPwm23: Number(0),
        schPwm14: Number(0),
        schPwm24: Number(0),
        schPwm15: Number(0),
        schPwm25: Number(0),
      },
      create: {
        macAddress,
        tag,
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
        workmode,
        lightmode,
        relay,
        relay,
        pwm_freq,
        pwm1,
        pwm2,
        mid,
        schStartTime1: "00:00",
        schStartTime2: "00:00",
        schStartTime3: "00:00",
        schStartTime4: "00:00",
        schStartTime5: "00:00",
        schEndTime1: "00:00",
        schEndTime2: "00:00",
        schEndTime3: "00:00",
        schEndTime4: "00:00",
        schEndTime5: "00:00",
        schActive1: "false",
        schActive2: "false",
        schActive3: "false",
        schActive4: "false",
        schActive5: "false",
        schPwm11: Number(0),
        schPwm21: Number(0),
        schPwm12: Number(0),
        schPwm22: Number(0),
        schPwm13: Number(0),
        schPwm23: Number(0),
        schPwm14: Number(0),
        schPwm24: Number(0),
        schPwm15: Number(0),
        schPwm25: Number(0),
      },
    })
    // console.log('✅ Devices upserted :', devices)

    if (Array.isArray(schListSunday) && schListSunday.length > 0) {
      const updateData = {};
      const createData = {
        macAddress,
        tag,
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
        workmode,
        lightmode,
        relay,
        pwm_freq,
        pwm1,
        pwm2,
        mid,
      };

      for (let i = 0; i < Math.min(5, schListSunday.length); i++) {
        const schedule = schListSunday[i];
        const idx = i + 1;

        updateData[`schStartTime${idx}`] = schedule.start_time;
        updateData[`schEndTime${idx}`] = schedule.end_time;
        updateData[`schActive${idx}`] = String(schedule.active);
        updateData[`schPwm1${idx}`] = Number(schedule.pwm1);
        updateData[`schPwm2${idx}`] = Number(schedule.pwm2);

        createData[`schStartTime${idx}`] = schedule.start_time;
        createData[`schEndTime${idx}`] = schedule.end_time;
        createData[`schActive${idx}`] = String(schedule.active);
        createData[`schPwm1${idx}`] = Number(schedule.pwm1);
        createData[`schPwm2${idx}`] = Number(schedule.pwm2);
      }

      await prisma.Devices.upsert({
        where: { id: devices.id },
        update: updateData,
        create: createData,
      });

      // console.log('✅ Schedule data upserted (separated by 5 index)');
    }
    return devices;

  } catch (err) {
    console.error('❌ insertDevices error:', err)
  }
}

exports.updateMode = async (req, res) => {
  try {
    const { macAddress, mode } = req.body
    const modeupdate = await prisma.Devices.update({
      where: { macAddress },
      data: {
        workmode: mode
      }
    })
    console.log(`MacAddress: ${macAddress} | Modeupdate: ${modeupdate.workmode}`)
    res.json({ msg: "OK" })
  } catch (err) {
    console.log(err)
    res.json({ msg: "Error" })
  }
}

exports.getMacDatas = async (req, res) => {
  try {
    const { macaddress } = req.params
    const obj = await prisma.Devices.findMany({
      where: { macAddress: String(macaddress) }
    })
    // console.log(`datas ${mac}`)
    res.json({ data: obj })
  } catch (err) {
    console.log(err)
    res.json({ msg: "Error" })
  }
}

exports.getLampTime = async (req, res) => {
  try {
    const lamptime = await prisma.Devices.findMany({
      select: {
        timestamp: true
      }
    })

    res.json(lamptime)

  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
  }
}

exports.getAlldevices = async (req, res) => {
  try {
    const devices = await prisma.Devices.findMany({
      select: {
        macAddress: true,
        tag: true,
        relay: true,
        pwm_freq: true,
        lightmode: true,
        pwm1: true,
        pwm2: true,
        workmode: true,
        mid: true
      }
    })
    // console.log(`datas ${obj}`)
    res.json({ devices })
  } catch (err) {
    console.log(err)
    res.json({ msg: "Error" })
  }
}

exports.getGroupdevices = async (req, res) => {
  try {
    const group = String(req.params?.group);
    let groupdevices = [];

    if (group === '0') {
      groupdevices = await prisma.Devices.findMany({
        select: {
          macAddress: true,
          tag: true,
          relay: true,
          pwm_freq: true,
          lightmode: true,
          mid: true,
          workmode: true,
        }
      });
    } else {
      groupdevices = await prisma.Devices.findMany({
        where: {
          mid: String(group)
        },
        select: {
          macAddress: true,
          tag: true,
          relay: true,
          pwm_freq: true,
          lightmode: true,
          mid: true,
          workmode: true,
        }
      });
    }

    res.json(groupdevices);
  } catch (err) {
    console.log(err);
    res.json({ msg: "Error" });
  }
}


exports.deleteDevices = async (req, res) => {
  try {
    const { macAddress } = req.body
    const devices = await prisma.devices.delete({
      where: {
        macAddress
      }
    })

    console.log(`Devices ${devices?.macAddress} is Delete`)
    res.json({ status: `Devices ${devices?.macAddress} is Delete` })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "Server Error" })
  }
}