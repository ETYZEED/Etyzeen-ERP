const express = require('express');
const app = express();

// Simple health check
app.get('/', (req, res) => {
  res.send('Minimal server is running');
});

const port = 4000;
app.listen(port, () => {
  console.log(`Minimal server running on port ${port}`);
});
