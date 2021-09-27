// var picker_btn = document.getElementById('pickerbtn');
// const oauthToken = picker_btn.getAttribute('access-data');


var authed = false
function showPickerDialog() {
    // loadPicker();
    if (!authed) {
        loadPicker();
    } else {
        gapi.load('picker', { 'callback': onPickerApiLoad });
    }

}

var developerKey = 'AIzaSyBxeQkzqOpg_ZGKE_zWj2cv0smmUI_jXuc';
var clientId = "852243973405-2s7568m1iahuv6jk2qbdpf1mnem7fq2i.apps.googleusercontent.com"
var appId = "drive-api-326918";
var scope = ['https://www.googleapis.com/auth/drive'];

var pickerApiLoaded = false;
var oauthToken;


function loadPicker() {
    gapi.load('auth', { 'callback': onAuthApiLoad });
    gapi.load('picker', { 'callback': onPickerApiLoad });
    authed = true;
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
        // view.setMimeTypes("image/png,image/jpeg,image/jpg");
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
var fileId
// A simple callback implementation.
function pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED) {
        fileId = data.docs[0].id;
        // alert('The file selected ');
        document.getElementById('alert').innerText = fileId + "selected!";
        var delete_btn = document.getElementById('deletebtn');
        delete_btn.setAttribute('href', `/delete/${fileId}`);
        var download_btn = document.getElementById('download');
        download_btn.setAttribute('href', `/download/${fileId}`);
        var view_btn = document.getElementById('view');
        view_btn.setAttribute('href', `/view/${fileId}`);
    }
}

