const express = require('express');
const nano = require('nano')(process.env.COUCHDB_URL); 

const PORT = 3000;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json());

const dbName = 'users';

async function createDatabase(dbName) {
    try {
        await nano.db.create(dbName);
        console.log(`Database '${dbName}' created successfully!`);
    } catch (error) {
        if (error.statusCode === 412) {
            console.log(`Database '${dbName}' already exists.`);
        } else {
            console.error('Error creating database:', error.message);
        }
    }
}

createDatabase(dbName); 
const usersDb = nano.use(dbName);

// Add a user
app.post('/api/couch-users', async (req, res) => {
    try {
        const user = await usersDb.insert(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get users
app.get('/api/couch-users', async (req, res) => {
    try {
        const { rows } = await usersDb.list({ include_docs: true });
        res.json(rows.map(row => row.doc));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to this site');
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});
