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

router.get('/',(req,res)=>{
    if(req.session.user){
        res.send(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" type="image/x-icon" href="https://cdn.autodesk.io/favicon.ico">
    <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css">
    <link rel="stylesheet" href="/main.css">
    <title>Autodesk Platform Services: Simple Viewer</title>
</head>

<body>
    <div id="header">
        <img class="logo" src="https://cdn.autodesk.io/logo/black/stacked.png" alt="Autodesk Platform Services">
        <span class="title">Hello ${req.session.user.name} welcome to your Simple Viewer</span>
        <select name="models" id="models"></select>
        <button id="upload" title="Upload New Model">Upload</button>
        <input style="display: none" type="file" id="input">
        <a href="/logout"><button>Logout</button></a>
    </div>
    <div id="preview"></div>
    <div id="overlay"></div>
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js"></script>
    <script src="/main.js" type="module"></script>
</body>

</html>
`)
    }
    else{
        res.send(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" type="image/x-icon" href="https://cdn.autodesk.io/favicon.ico">
    <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css">
    <link rel="stylesheet" href="/main.css">
    <title>Autodesk Platform Services: Simple Viewer</title>
 
</head>

<body>
    <div id="header">
        <img class="logo" src="https://cdn.autodesk.io/logo/black/stacked.png" alt="Autodesk Platform Services">
        <span class="title">Simple Viewer</span>
    
    <button class="login-btn" onclick="openModal()">LOGIN</button>
    
    <div id="loginModal" class="modal" >
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Login</h2>
            <form action="/login" method="POST">
                <input type="text" placeholder="Username" name="username" required>
                <input type="password" placeholder="Password" name="password" required>
                <button type="submit" class="submit-btn">Login</button>
            </form>
        </div>
    </div>
    </div>
    <div id="preview"></div>
    <div id="overlay"></div>
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js"></script>
    <script src="/main.js" type="module"></script>
    <script>
             // Open the modal
        function openModal() {
            document.getElementById('loginModal').style.display = 'flex';
        }

        // Close the modal
        function closeModal() {
            document.getElementById('loginModal').style.display = 'none';
        }

        // Close modal if clicked outside content
        window.onclick = function(event) {
            const modal = document.getElementById('loginModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    </script>
</body>

</html>
`)
    }
    
})

// const USERNAME = 'raja';
// const PASSWORD = 'r@123';

const fs = require('fs');
const path = require('path');

// Define the path to the text file
const filePath = path.join(__dirname, 'users.txt');

// Function to authenticate the user
async function  authenticateUser(username, password) {
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


// Login route
router.post('/login',async  (req, res) => {
    const { username, password } = req.body;
    if (await authenticateUser(username,password)) {
        // Create session if credentials are correct
        console.log(req.query.hash);
        req.session.user = {name:username};
        res.redirect(`/`);
    } else {
        res.send('Invalid credentials, please <a href="/">try again</a>.');
    }
});
router.get('/logout', (req, res) => {
    req.session.destroy(); // Destroy session on logout
    res.redirect('/');
});

module.exports = router;
