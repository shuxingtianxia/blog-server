const express = require('express')

const router = express.Router()

const {bannerSchema} = require('../..//modules/banner')

router.get('/banner', (req, res) => {
  bannerSchema.find().sort({_id:-1}).then(doc => {
    return res.json({code:0, data:doc})
  })
})

module.exports = router