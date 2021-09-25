function showPickerDialog() {
    loadPicker()
}
// The Browser API key obtained from the Google API Console.
// Replace with your own Browser API key, or your own key.
var developerKey = 'AIzaSyBxeQkzqOpg_ZGKE_zWj2cv0smmUI_jXuc';

// The Client ID obtained from the Google API Console. Replace with your own Client ID.
var clientId = "852243973405-men20rtgs00qc5rejhsk7dbaav05tfp4.apps.googleusercontent.com"

// Replace with your own project number from console.developers.google.com.
// See "Project number" under "IAM & Admin" > "Settings"
var appId = "drive-api-326918";

// Scope to use to access user's Drive items.
var scope = ['https://www.googleapis.com/auth/drive.file'];

var pickerApiLoaded = false;
var oauthToken;

// Use the Google API Loader script to load the google.picker script.
function loadPicker() {
    // gapi.load('auth', { 'callback': onAuthApiLoad });
    gapi.load('picker', { 'callback': onPickerApiLoad });
}

function onAuthApiLoad() {
    window.gapi.auth.authorize(
        {
            'client_id': clientId,
            'scope': scope,
            'immediate': false
        },
        handleAuthResult);
}

function onPickerApiLoad() {
    pickerApiLoaded = true;
    createPicker();
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
    }
}

// Create and render a Picker object for searching images.
function createPicker() {
    if (pickerApiLoaded && oauthToken) {
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("image/png,image/jpeg,image/jpg");
        var picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(appId)
            .setOAuthToken(oauthToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setDeveloperKey(developerKey)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }
}

// A simple callback implementation.
function pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        // alert('The user selected: ' + fileId);
        var delete_btn = document.getElementById('deletebtn');
        delete_btn.setAttribute('href', `/delete/${fileId}`);
    }
}


(function () {
    /**
     * Initialise a Google Driver file picker
     */
    var FilePicker = window.FilePicker = function (options) {
        // Config
        this.apiKey = options.apiKey;
        this.clientId = options.clientId;

        // Elements
        this.buttonEl = options.buttonEl;

        // Events
        this.onSelect = options.onSelect;
        this.buttonEl.addEventListener('click', this.open.bind(this));

        // Disable the button until the API loads, as it won't work properly until then.
        this.buttonEl.disabled = true;

        // Load the drive API
        gapi.client.setApiKey(this.apiKey);
        gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this));
        google.load('picker', '1', { callback: this._pickerApiLoaded.bind(this) });
    }

    FilePicker.prototype = {
        /**
         * Open the file picker.
         */
        open: function () {
            // Check if the user has already authenticated
            var token = gapi.auth.getToken();
            if (token) {
                this._showPicker();
            } else {
                // The user has not yet authenticated with Google
                // We need to do the authentication before displaying the Drive picker.
                this._doAuth(false, function () { this._showPicker(); }.bind(this));
            }
        },

        /**
         * Show the file picker once authentication has been done.
         * @private
         */
        _showPicker: function () {
            var accessToken = gapi.auth.getToken().access_token;
            this.picker = new google.picker.PickerBuilder().
                addView(google.picker.ViewId.DOCUMENTS).
                setAppId(this.clientId).
                setOAuthToken(accessToken).
                setCallback(this._pickerCallback.bind(this)).
                build().
                setVisible(true);
        },

        /**
         * Called when a file has been selected in the Google Drive file picker.
         * @private
         */
        _pickerCallback: function (data) {
            if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                var file = data[google.picker.Response.DOCUMENTS][0],
                    id = file[google.picker.Document.ID],
                    request = gapi.client.drive.files.get({
                        fileId: id
                    });

                request.execute(this._fileGetCallback.bind(this));
            }
        },
        /**
         * Called when file details have been retrieved from Google Drive.
         * @private
         */
        _fileGetCallback: function (file) {
            if (this.onSelect) {
                this.onSelect(file);
            }
        },

        /**
         * Called when the Google Drive file picker API has finished loading.
         * @private
         */
        _pickerApiLoaded: function () {
            this.buttonEl.disabled = false;
        },

        /**
         * Called when the Google Drive API has finished loading.
         * @private
         */
        _driveApiLoaded: function () {
            this._doAuth(true);
        },

        /**
         * Authenticate with Google Drive via the Google JavaScript API.
         * @private
         */
        _doAuth: function (immediate, callback) {
            gapi.auth.authorize({
                client_id: this.clientId + '.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                immediate: immediate
            }, callback);
        }
    };
}());