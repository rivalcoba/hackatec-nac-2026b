const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/vendor/model-viewer.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/@google/model-viewer/dist/model-viewer.min.js'));
});
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
