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
    <link rel="icon" type="image/x-icon" href="2.jpeg">
    <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css">
    <link rel="stylesheet" href="/main.css">
    <title>Trishita:Smart-Connect</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" rel="stylesheet">
  <style>

  </style>
</head>

<body>
    <!-- <div id="header">
        <img class="logo" src="" alt="Autodesk Platform Services">
        <span class="title">Hello ${req.session.user.name} welcome to your Simple Viewer</span>
        <select name="models" id="models"></select>
        
        <button id="upload" title="Upload New Model">Upload</button>
        <input style="display: none" type="file" id="input">
        <a href="/logout"><button>Logout</button></a>
    </div>
    -->

   <!-- <nav class="navbar">
        <div class="logo">MyLogo</div>
        <span class="title">Hello ${req.session.user.name} welcome to your Simple Viewer</span>
        <select name="models" id="models"></select>
        <button id="upload" title="Upload New Model">Upload</button>
        <input style="display: none" type="file" id="input">
        <a href="/logout"><button>Logout</button></a>

    </nav>

    -->

    <nav class="navbar">
    
    <div class="container-fluid">
      
            <img src="TRISHITA.png" alt="MyLogo" style="height: 35px;display:inline">
            <div>
            

                <button type="button" class="login-btn" data-bs-toggle="modal" data-bs-target="#uploadModal" >
                <i class="bi bi-upload"></i>
    Upload
  </button>

  <!-- Modal Structure -->
  <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
    <div class="modal-dialog custom-modal">
      <div class="modal-content custom-modal ">
        <!-- Modal Body with background and file input -->
        <div class="modal-body upload-modal">
          <h5 id="uploadModalLabel">Upload Your File</h5>
          <form>
            <!-- File Input -->
            <div class="mb-3">
              <input class="form-control" type="file" id="input">
            </div>
          </form>
        </div>
        <!-- Modal Footer with buttons -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" id="upload" title="Upload New Model">Submit</button>
        </div>
      </div>
    </div>
  </div>

            </button>
          <select name="models" id="models" class="custom-select"></select>
           <button class="login-btn" onclick="redirectToLogin()"><i class="bi bi-box-arrow-right"></i> Logout</button>
           </div>
    </div>
  </nav>

    <div id="preview"></div>
    <div id="overlay"></div>
    <div id="loggedin" style="display:none">true</div>
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js"></script>
    <script src="/main.js" type="module"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    function redirectToLogin() {
    window.location.href = "/logout";
}
    </script>
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
    <link rel="icon" type="image/x-icon" href="2.jpeg">
    <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css">
    <link rel="stylesheet" href="/main.css">
    <title>Trishita:Smart-Connect</title>
</head>


<body>
    <!--<div id="header">
       <img class="logo" src="" alt="Autodesk Platform Services">
        <span class="title">Simple Viewer</span>
    
        <a href="/login" class="button">Click me</a>
    </div>
    -->

    <nav class="navbar">
        <div class="logo">
            <img src="TRISHITA.png" alt="MyLogo" style="height: 35px;">
        </div>
        <a href="/login" ><button class="login-btn" >Sign In</button></a>
    </nav>

    <div id="preview"></div>
    <div id="overlay"></div>
    
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js"></script>
    <script src="/main.js" type="module"></script>
    
</body>


</html>
`)

router.get('/login',(req,res)=>{

    if(req.session.user){
        res.redirect("/")
    }
    else{

        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trisita Smart-Connect</title>
    <link rel="icon" type="image/x-icon" href="2.jpeg">
    <link rel="stylesheet" href="styles.css">
    <style>
    * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, sans-serif;
}

.background {
    height: 100vh;
    background-image: url('23324.jpg');
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-box {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    height:360px;
    width:342px;
}

h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

h1 span {
    font-weight: bold;
}



.button {
    width: 100%; /* Ensure buttons take full width of the container */
    max-width: 200px; /* Set a max-width for the buttons */
    padding: 13px 20px;
    background-color: #007BFF;
    border: none;
    color: white;
    margin: 10px 0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
    margin:33px;
    box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.3); /* Add shadow */
    transition: box-shadow 0.3s ease;
}
    span{
     margin:10px;
    }

.button:hover {
    background-color: #0056b3;
     box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.4);
}
.button1{

 width: 100%; /* Ensure buttons take full width of the container */
    max-width: 200px; /* Set a max-width for the buttons */
    padding: 10px 20px;
    background-color: #007BFF;
    border: none;
    color: white;
    margin: 10px 0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
    box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.3); /* Add shadow */
    transition: box-shadow 0.3s ease;

}

.button1:hover{
        background-color: #0056b3;
         box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.4);

}

#login-form {
    margin-top: 20px;
    
}

#login-form input {
    width: 100%;

    display:flex;
    flex-direction:column;
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    border: 1px solid #ddd;
}

#login-form label {
    display: block;
    text-align: left;
    margin-bottom: 5px;
    
}


.hidden {
    display: none;
}

#createAccountBtn{
            width: 100%; /* Ensure buttons take full width of the container */
    max-width: 200px; /* Set a max-width for the buttons */
    padding: 13px 20px;
    background-color: #7b7e81;
    border: none;
    color: white;
    margin: 10px 0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
    margin:33px;
}

#createAccountBtn:hover{
             background-color: #404447;
}


    </style>
</head>
<body>
    <div class="background">
        <div class="login-box">
            <img src="TRISHITA.png" style="height: 40px;"> <h1><div>Smart-Connect</div></h1>
            <div id="login-options">
                
                <button id="signInBtn" class="button">Sign In</button>
                
                <button id="createAccountBtn" class="button">Create Account</button>
            </div>

            <div id="login-form" class="hidden">
                <form action="/login" method="POST">
                    <label>Username:</label>
                    <input id="email" name="username" required>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                    <button type="submit" class="button1">Login</button>
                </form>
            </div>
        </div>
    </div>

    <script>
    document.getElementById("signInBtn").addEventListener("click", function() {
    document.getElementById("login-options").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
});

    </script>
</body>
</html>
`)

    }

})


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
    console.log(username,password);
    
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
