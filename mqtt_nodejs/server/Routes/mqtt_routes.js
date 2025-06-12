const express = require('express')
const { turnOffLight, turnOnLight, getMidDatas, deviceResp } = require('../Controller/mqtt_controller')
const { insertDatas } = require('../Controller/database_manage')
const router = express.Router()

router.post("/turnonlight/", turnOnLight)
router.post("/turnofflight/", turnOffLight)
router.get("/deviceresp/", deviceResp)
router.get("/getmiddatas/", getMidDatas)

module.exports = router