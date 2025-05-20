<script>
    addEventListener("DOMContentLoaded", () => {
        const $ = Q$;

        let loginBox = $("#login-box");
        let signupBox = $("#signup-box");
                
        let loginBtn = $("#login-btn");
        let signupBtn = $("#signup-btn");

        function loginCallback(res) {
            // tokens last 1 week
            document.cookie = 'token=' + res + '; max-age=' + 60*60*24*7 +'; Secure; path=/';
            window.location.href = "/profile/me";
        }

        function signupWithGoogle(res) {
            
        }

        function recaptchaCallback () {
            let username = signupBox.$("*input")[0].value;
            let password = signupBox.$("*input")[1].value;
            
            fetch("/API/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    recaptchaRes: grecaptcha.getResponse()
                })
            }).then(res => res.text()).then(res => {
                if (res.includes("error") || res.includes(" ")) {
                    alert(res);
                } else {
                    loginCallback(res);
                }
            });
        }

        function validateUsername(username) {
            if (typeof username !== "string") {
                return "username must be a string";
            }
            if (username.length > 32) {
                return "username can't be longer than 32 characters";
            }
            if (!(/^[a-zA-Z0-9\_]+$/.test(username))) {
                return "username can only contain letters, numbers, and underscores";
            }
            if (username.length < 3) {
                return "username can't be shorter than 3 characters";
            }
            return "OK";
        }
        function validatePassword(password) {
            if (typeof password !== "string") {
                return "password must be a string";
            }
            if (password.length > 64) {
                return "password can't be longer than 64 characters";
            }
            return "OK";
        }

        function getCookies() {
            return Object.fromEntries(document.cookie.split("; ").map(s => {
                var e = s.indexOf("=");
                return [s.slice(0, e), s.slice(e + 1, s.length)];
            }));
        }

        // login
        $(".form")[0].on("submit", function (e) {
            e.preventDefault();

            let username = loginBox.$("*input")[0].value;
            let password = loginBox.$("*input")[1].value;

            if (validateUsername(username) !== "OK") {
                alert(validateUsername(username));
                return false;
            }

            if (validatePassword(password) !== "OK") {
                alert(validatePassword(password));
                return false;
            }
            
            fetch("/API/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            }).then(res => res.text()).then(function (res) {
                if (res.includes("error")) {
                    alert(res);
                } else {
                    loginCallback(res);
                }
            });
        });

        // signup
        $(".form")[1].on("submit", function (e) {
            e.preventDefault();

            let username = signupBox.$("*input")[0].value;
            let password = signupBox.$("*input")[1].value;

            let usernameCheck = validateUsername(username);
            if (usernameCheck !== "OK") {
                alert(usernameCheck);
                return false;
            }

            let passwordCheck = validatePassword(password);
            if (passwordCheck !== "OK") {
                alert(passwordCheck);
                return false;
            }

            $("script")
                .attr({
                    src: "https://www.google.com/recaptcha/api.js"
                })
                .appendTo(document.body)
            
            signupBtn.style.display = "none";
        });

        // window.onload = function () {
        //     google.accounts.id.initialize({
        //         client_id: 'YOUR_GOOGLE_CLIENT_ID',
        //         callback: handleCredentialResponse
        //     });
        //     google.accounts.id.prompt();
        // };
    });
</script>

<div style="display: flex; margin: 1px;">
    <script src="https://accounts.google.com/gsi/client" async></script>
    <div id="login-box">
        <h1>Login to Your Account</h1>

        <p style="margin-left: 15%; margin-right: 15%;">By logging into an account you represent that you have read, understand, and agree to our <a href="/tos">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a></p>

        <form class="form" style="display: block;">
            <strong>Username</strong>
            <br>
            <input type="text">

            <br><br>
            
            <strong>Password</strong>
            <br>
            <input type="password">

            <br><br>

            <input id="login-btn" class="button" type="submit" value="Login">
        </form>
    </div>
    <div id="signup-box">
        <h1>New Here?</h1>

        <p style="margin-left: 15%; margin-right: 15%;">Create an account. <br>By creating an account you represent that you have read, understand, and agree to our <a href="/tos">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a></p>

        <!-- <div id="g_id_onload" style="margin: auto;"
                data-client_id="740921512545-ijrl4772srtbbmfoasl6gajd9b80s003.apps.googleusercontent.com"
                data-context="signup"
                data-ux_mode="popup"
                data-callback="signupWithGoogle"
                data-nonce=""
                data-auto_prompt="false">
        </div>
        
        <div class="g_id_signin"
                data-type="standard"
                data-shape="rectangular"
                data-theme="outline"
                data-text="signup_with"
                data-size="large"
                data-logo_alignment="left">
        </div> -->

        <p>Or continue with Username/Password</p>
        
        <form class="form" style="display: block;">
            <strong>Username</strong>
            <br>
            <input type="text">

            <br><br>
            
            <strong>Password</strong>
            <br>
            <input type="password">

            <br><br>

            <div class="g-recaptcha" style="transform: translate(0px, 50px);" data-callback="recaptchaCallback" data-sitekey="6Lf2sFchAAAAAFKx_gep0Nz8qFwImwZ5rJK9VWuH"></div>
            
            <input id="signup-btn" class="button" style="position: relative; z-index: 10000;" type="submit" value="Sign Up!">
        </form>
    </div>
</div>

<style>
    /* :global(body) {
        overflow: hidden;
    } */
    
    :global(#page-middle-container) {
        text-align: center;
    }

    .button {
        background-color: rgb(13, 146, 63);
        border: 0px solid white;
        border-radius: 4px;
        margin-right: 8px;
        padding: 8px;
        padding-left: 14px;
        padding-right: 14px;
        color: white;
        font-size: 17px;
        font-weight: 400;
    }
    .button:hover {
        background-color: rgb(10, 130, 50);
        /*border: 2px rgb(0, 80, 0) solid;*/
        box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.9);
        cursor: pointer;
    }

    input {
        margin-top: 4px;
        padding: 4px;
        padding-left: 8px;
        padding-right: 8px;
        width: 40%;
        border: 2px solid rgb(125, 125, 125);
        border-radius: 100px;
    }

    #login-box, #signup-box {
        padding: 16px;
        height: calc(100vh - 176px);
    }

    #login-box {
        background-color: var(--background); 
        width: 70%;
    }

    #signup-box {
        background-image: linear-gradient(140deg, #9dffa8 0%, rgb(31, 171, 84) 75%); 
        width: 30%; 
    }

    /* #login-box div, #signup-box div {
        position: relative;
        top: 50%;
        transform: translateY(-60%);
    } */

    #login-btn, #signup-btn {
        width: fit-content;
    }
    
</style>