<script>
    addEventListener("DOMContentLoaded", () => {
        const $ = Q$;

        let resetBox = $("#reset-box");
        let resetBtn = $("#reset-btn");

        // reset
        $(".form")[0].on("submit", function (e) {
            e.preventDefault();

            let username = resetBox.$("*input")[0].value;
            let password = resetBox.$("*input")[1].value;
            let newPassword = resetBox.$("*input")[2].value;

            if (validateUsername(username) !== "OK") {
                alert(validateUsername(username));
                return false;
            }

            if (validatePassword(password) !== "OK") {
                alert(validatePassword(password));
                return false;
            }

            if (validatePassword(newPassword) !== "OK") {
                alert(validatePassword(newPassword));
                return false;
            }
            
            fetch("/API/change_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    new_password: newPassword
                })
            }).then(res => res.text()).then(function (res) {
                if (res.toLowerCase().includes("error")) {
                    alert(res);
                } else {
                    if (res === "OK") {
                        alert("Password changed successfully!");
                        window.location.href = "/";
                    } else {
                        alert(res);
                    }
                }
            });
        });
    });
</script>

<div style="display: flex; margin: 1px; justify-content: center;">
    <script src="/CDN/validators.js"></script>

    <div id="reset-box">
        <h1>Change Password</h1>

        <form class="form" style="display: block;">
            <p style="margin-left: 15%; margin-right: 15%;">Enter your current login</p>

            <strong>Username</strong>
            <br>
            <input type="text">

            <br><br>
            
            <strong>Current Password</strong>
            <br>
            <input type="password">

            <br><br>

            <p style="margin-left: 15%; margin-right: 15%;">Enter a new password below</p>

            <strong>New Password</strong>
            <br>
            <input type="password">

            <br><br>

            <input id="reset-btn" class="button" type="submit" value="Change Password">
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

    #reset-box {
        padding: 16px;
        height: calc(100vh - 176px);
        background-color: var(--background); 
        width: 90%;
    }

    #reset-btn {
        width: fit-content;
    }
    
</style>