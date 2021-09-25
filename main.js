$(document).ready(function () {

    var clientId = "789979128110-u4hbeukesf3dds70bc3npu8od5p2sbfd.apps.googleusercontent.com";
    var redirect_uri = "http://localhost:5501/upload.html";
    var scope = "https://www.googleapis.com/auth/drive";

    var url = "";// the url to which the user is redirected to

    $("#login").click(function () { //event listener
        signIn(clientId, redirect_uri, scope, url);

    });

    function signIn(clientId, redirect_uri, scope, url) {
        url = "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=" + redirect_uri
            + "&prompt=consent&response_type=code&client_id=" + clientId + "&scope=" + scope
            + "&access_type=offline";

        // this will redirect to actual  redirected url 
        window.location = url;

    }

});