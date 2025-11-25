require('dotenv').config();

const { app, PORT } = require('./app');

app.listen(PORT, () => {
	console.info(`🚀 Backend ready on http://localhost:${PORT}`);
});
