const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

exports.uploadCSV = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully.');
};

exports.getCSVFiles = (req, res) => {
    fs.readdir(path.join(__dirname, '../uploads'), (err, files) => {
        if (err) return res.status(500).send('Unable to scan directory.');
        res.json(files);
    });
};

exports.getCSVData = (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    let results = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        });
};
