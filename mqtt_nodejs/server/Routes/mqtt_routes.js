const express = require('express')
const { turnOffLight, turnOnLight, deviceResp, updateModeMqtt, turnOnLightVal, setScheduleLight, turnOnAllLight, turnOffAllLight, turnOnAllLightVal, setAllScheduleLight } = require('../Controller/mqtt_controller')
const { getMacDatas, getLampTime, getAlldevices, deleteDevices, getGroupdevices } = require('../Controller/database_manage')
const router = express.Router()

router.post("/turnonlight", turnOnLight)
router.post("/turnonlightval", turnOnLightVal)
router.post("/turnofflight", turnOffLight)
router.post("/turnonalllight", turnOnAllLight)
router.post("/turnoffalllight", turnOffAllLight)
router.post("/turnonalllightval", turnOnAllLightVal)
router.post("/updatemode/", updateModeMqtt)
router.post("/setschedule", setScheduleLight)
router.post("/setallschedule", setAllScheduleLight)

router.get('/getLampTime', getLampTime)
router.get('/getalldevices', getAlldevices)
router.get('/getgroupdevices/:group', getGroupdevices)
router.get("/deviceresp", deviceResp)
router.get("/getmacdatas/:macaddress", getMacDatas)

router.delete("/deletedevices", deleteDevices)


module.exports = router