const fs = require("fs");
const open = require('open');
const path = require('path');
const express = require("express");
const app = express();
const multer = require("multer");
const { google } = require("googleapis");
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });



app.use('/public', express.static(path.join(__dirname, 'public')));

app.set("view engine", "pug");


const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URL = process.env.redirect_uris;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
var authed = false;

// If modifying these scopes, delete token.json.
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";




var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count


// oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN });


var name, pic, _id
app.get("/", (req, res) => {
  // res.render('index');
  if (!authed) {
    // Generate an OAuth URL and redirect there
    const Url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log(Url);
    res.render("index", { url: Url });
  } else {
    var oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    oauth2.userinfo.get(function (err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(response.data);
        _id = response.data.id
        name = response.data.name
        pic = response.data.picture
        res.render("success", {
          name: response.data.name,
          pic: response.data.picture,
          success: false,
          delet: false
        });
      }
    });
  }
});

app.get('/logout', (req, res) => {
  authed = false
  res.redirect('/')
})

app.get("/auth/google/callback", function (req, res) {
  const code = req.query.code;
  if (code) {
    // Get an access token based on our OAuth code
    oAuth2Client.getToken(code, function (err, tokens) {
      if (err) {
        console.log("Error authenticating");
        console.log(err);
      } else {
        console.log("Successfully authenticated");
        console.log(tokens)
        oAuth2Client.setCredentials(tokens);

        authed = true;
        res.redirect("/");
      }
    });
  }
});



app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.end("Something went wrong");
    } else {
      console.log(req.file.path);
      const drive = google.drive({ version: "v3", auth: oAuth2Client });
      const fileMetadata = {
        name: req.file.filename,
      };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: "id",
        },
        (err, file) => {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            fs.unlinkSync(req.file.path)
            res.render("success", { name: name, pic: pic, success: true, delet: false })
          }

        }
      );
    }
  });
});



const drive = google.drive({
  version: 'v3',
  auth: oAuth2Client
})



app.get('/delete/:id', async function deletefile(req, res) {
  try {
    const _id = req.params.id;
    const response = await drive.files.delete({
      fileId: _id
    });
    console.log(response.data, response.status);
    authed = true;
    res.render("success", { name: name, pic: pic, delet: true, success: false });
    // res.redirect('/');
  } catch (err) {
    console.log(err.message);
    res.redirect('/')
  }
})


app.get('/download/:id', async function (req, res) {
  try {
    const fileid = req.params.id;
    await drive.permissions.create({
      fileId: fileid,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    const result = await drive.files.get({
      fileId: fileid,
      fields: 'webContentLink'
    });
    console.log(result.data);
    open(result.data.webContentLink);
    // authed = true;
    // res.redirect('/');
  } catch (err) {
    console.log(err.message);
  }
});
app.get('/view/:id', async function (req, res) {
  try {
    const fileid = req.params.id;
    await drive.permissions.create({
      fileId: fileid,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    const result = await drive.files.get({
      fileId: fileid,
      fields: 'webViewLink'
    });
    console.log(result.data);
    open(result.data.webViewLink);
    // authed = true;
    // res.redirect('/');
  } catch (err) {
    console.log(err.message);
  }
});




app.listen(5000, () => {
  console.log("App is listening on Port 5000");
});
