$(document).ready(function () {
    var baseurl = 'http://118.24.214.111:9000/home/voicetagging/';
    
    /**
     * 刷新图片
     */
    function changeImg() {
        var imgSrc = $("#LAY-user-get-vercode");
        var src = imgSrc.attr("src");
        imgSrc.attr("src", changeUrl(src));
    }
    function changeUrl(url) {
        var timestamp = (new Date()).valueOf();
        var index = url.indexOf("?", url);
        if (index > 0) {
            url = url.substring(index, url.indexOf(url, "?"));
        }
        if ((url.indexOf("&") >= 0)) {
            url = url + "×tamp=" + timestamp;
        } else {
            url = url + "?timestamp=" + timestamp;
        }
        return url;
    }


    /**
     * 加载验证码
     */
    $("#LAY-user-get-vercode").attr('src', baseurl+'apicode/'+Math.floor(Math.random()*1000+5000));

    /**
     * 更换验证码
     */
    $('#LAY-user-get-vercode').on('click', function () {
        changeImg();
    })

    $("#login").on("click",function () {
        var Ouser = $("#user").val();
        var Opassword = $("#password").val();
        var Ocode = $("#code").val();
        if (Ouser == '' || Opassword == ''||Ocode=='') {
            alert("不允许有空");
        }else {
            var checked = $("input[type='checkbox']").is(':checked'); //获取“是否记住密码”复选框 
            if (checked) {
                storage.clear();
                storage.user = Ouser;
                storage.password = Opassword;
            } else {
                storage.clear();
            }
            $.ajax({
                type: "POST",
                url: baseurl + "apiuser/account",
                headers: {
                    "Content-type": "application/json; charset=utf-8"
                },
                data: JSON.stringify({
                    "name": $("#user").val(),
                    "password": $("#password").val(),
                    "code":Ocode
                }),
                success: function (res) {
                    var state=res.state;
                    switch (state) {
                        case 0://OK
                            localStorage.setItem("nowUser",JSON.stringify(res.staffMember));
                            localStorage.setItem("token",res.staffMember.token);
                            $(location).prop('href', "index.html");
                            break;

                        case 1://ERROR_ACCOUNT
                            alert("账号不存在");
                            break;

                        case 2://ERROR_PWD
                            alert("密码错误");
                            break;

                        case 3://ERROR_AUTH
                            alert("没有权限");
                            break;
                        case 4://ERROR_CODE
                            alert("账号冻结,请联系管理员");
                            break;
                        case 5://ERROR_CODE
                            alert("验证码错误");
                            break;

                        default://DEFAULT
                            alert("发生未知错误");
                            break;
                    }
                },
                error: function () {
                    alert("连接失败");
                    localStorage.setItem("nowUser",'{"account":"158302945684","name":"ChengXX","characterType":"PROJECT_MANAGER","status":"ACTIVE","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MiJ9._majDWe89qvJrzxPp4nU06R_ATccc07TEf-CrRDkdhQ"}');
                    // localStorage.setItem("nowUser",'{"account":"15609077835","name":"sugar","characterType":"BOSS","status":"ACTIVE","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIn0.bFwLcjdORwcB3OhUWK1wjVe7P3gcum1xwFY2USrqo4k"}');
                    localStorage.setItem("token","acdefegg");
                    $(location).prop('href', "index.html");
                }
            });
        }
    });

    
    if (!window.localStorage) {
        //alert("浏览器不支持本地缓存");
    } else {
        var storage = window.localStorage;
        if (storage.user != null && storage.password != null) {
            $("input[type='checkbox']")[0].checked = true;
            $("#user").val(storage.user);
            $("#password").val(storage.password);
        }

    }
});