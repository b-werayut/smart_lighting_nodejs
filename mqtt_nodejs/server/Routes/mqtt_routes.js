const express = require('express')
const { turnOffLight, turnOnLight, getMidDatas, deviceResp, updateModeMqtt, turnOnLightVal, setScheduleLight } = require('../Controller/mqtt_controller')
const { insertDatas, getMacDatas } = require('../Controller/database_manage')
const router = express.Router()

router.post("/turnonlight", turnOnLight)
router.post("/turnonlightval", turnOnLightVal)
router.post("/turnofflight", turnOffLight)
router.post("/setschedule", setScheduleLight)
router.get("/deviceresp", deviceResp)
router.get("/getmacdatas/:macaddress", getMacDatas)


router.post("/updatemode/", updateModeMqtt)

module.exports = router