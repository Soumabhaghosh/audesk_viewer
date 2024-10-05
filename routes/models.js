const express = require('express');
const formidable = require('express-formidable');

const { listObjects, uploadObject, translateObject, getManifest, urnify } = require('../services/aps.js');

let router = express.Router();

router.get('/api/models', async function (req, res, next) {
    try {
        const objects = await listObjects();
        res.json(objects.map(o => ({
            name: o.objectKey,
            urn: urnify(o.objectId)
        })));
    } catch (err) {
        next(err);
    }
});

router.get('/api/models/:urn/status', async function (req, res, next) {
    try {
        const manifest = await getManifest(req.params.urn);
        if (manifest) {
            let messages = [];
            if (manifest.derivatives) {
                for (const derivative of manifest.derivatives) {
                    messages = messages.concat(derivative.messages || []);
                    if (derivative.children) {
                        for (const child of derivative.children) {
                            messages.concat(child.messages || []);
                        }
                    }
                }
            }
            res.json({ status: manifest.status, progress: manifest.progress, messages });
        } else {
            res.json({ status: 'n/a' });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/api/models', formidable({ maxFileSize: Infinity }), async function (req, res, next) {
    const file = req.files['model-file'];
    if (!file) {
        res.status(400).send('The required field ("model-file") is missing.');
        return;
    }
    try {
        const obj = await uploadObject(file.name, file.path);
        await translateObject(urnify(obj.objectId), req.fields['model-zip-entrypoint']);
        res.json({
            name: obj.objectKey,
            urn: urnify(obj.objectId)
        });
    } catch (err) {
        next(err);
    }
});


//Home Page
router.get('/', (req, res) => {
    if (req.session.user) {
        res.render('HomePageLoggedin')
    }
    else {
        res.render(`HomePageLoggedout`)
    }

})

//Login Page
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect("/")
    }
    else {
        res.render(`login`)
    }
})




// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    if (await authenticateUser(username, password)) {
        // Create session if credentials are correct
        console.log(req.query.hash);
        req.session.user = { name: username };
        res.redirect(`/`);
    } else {
        res.send('Invalid credentials, please <a href="/">try again</a>.');
    }
});

//Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(); // Destroy session on logout
    res.redirect('/');
});



const fs = require('fs');
const path = require('path');

// Define the path to the text file
const filePath = path.join(__dirname, 'users.txt');

// Function to authenticate the user
async function authenticateUser(username, password) {
    // Read the file asynchronously
    try {
        // Read the file using await
        const data = await fs.readFileSync(filePath, 'utf8');

        // Split file content by new lines to get each user entry
        const users = data.split('\n');

        // Check if any line matches the provided username and password
        let isAuthenticated = false;

        for (let user of users) {
            const [storedUsername, storedPassword] = user.trim().split(':');

            if (storedUsername === username && storedPassword === password) {
                isAuthenticated = true;
                break;
            }
        }

        if (isAuthenticated) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error('Error reading the file:', err);
    }
}

module.exports = router;
