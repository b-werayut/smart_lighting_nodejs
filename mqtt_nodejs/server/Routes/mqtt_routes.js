const express = require('express')
const { turnOffLight, turnOnLight, deviceResp, updateModeMqtt, turnOnLightVal, setScheduleLight, turnOnAllLight, turnOffAllLight, turnOnAllLightVal } = require('../Controller/mqtt_controller')
const { getMacDatas, getLampTime, getAlldevices } = require('../Controller/database_manage')
const router = express.Router()

router.post("/turnonlight", turnOnLight)
router.post("/turnonlightval", turnOnLightVal)
router.post("/turnofflight", turnOffLight)
router.post("/turnonalllight", turnOnAllLight)
router.post("/turnoffalllight", turnOffAllLight)
router.post("/turnonalllightval", turnOnAllLightVal)

router.post("/setschedule", setScheduleLight)

router.get('/getLampTime', getLampTime)
router.get('/getalldevices', getAlldevices)
router.get("/deviceresp", deviceResp)
router.get("/getmacdatas/:macaddress", getMacDatas)


router.post("/updatemode/", updateModeMqtt)

module.exports = router