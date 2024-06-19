const express = require('express');
const multer = require('multer');

const router = express.Router();
const csvController = require('../controllers/csvController.js');


const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('csvfile'), csvController.uploadCSV);
router.get('/files', csvController.getCSVFiles);
router.get('/files/:filename', csvController.getCSVData);

module.exports = router;
