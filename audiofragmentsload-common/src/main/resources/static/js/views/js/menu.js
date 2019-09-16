//testPart
var auth = -1;
var auth_info;
var baseUrl = "http://118.24.214.111:9000/home/voicetagging/";
var CkdetialByid = -1;//角色管理质检员查看详请所需id
var account=null;
var token=localStorage.getItem("token");
var originAudios=null;
var goOn=false;
$(document).ready(function () {
    //清空菜单栏
    $('#left-content').empty();

    //判断是否登录
    var sessiondata = JSON.parse(localStorage.getItem("nowUser"));
    token = localStorage.getItem("token");
    if (sessiondata == null || token == null || token.trim() == "") {
        alert("未登录,请前往登录!!!");
        window.location.href = "login.html";
        return;
    }
    // console.log(sessiondata);
    account=sessiondata.account;
    //保存基本信息
    auth_info=sessiondata;
    //判断权限
    switch (auth_info.characterType) {
        case "BOSS":
            auth=1;
            break;
        case "PROJECT_MANAGER":
            auth=3;
            break;
        case "CHANNEL_MANAGER":
            auth=2;
            break;
        case "PROJECT_INSPECTOR":
            auth=4;
            break;
        case "PROJECT_NOTER":
            auth=6;
            break;
        case "PROJECT_QS":
            auth=5;
            break;
        default:
            alert("未登录,请前往登录!!!");
            window.location.href = "login.html";
            return;
    }
    // //testpart
    // auth=2;
    //设置导航栏用户名称
    $("#user-name").text(sessiondata.name);
    //初始化
    Init();

    //首先加载
    LoadPage("myself.html");


    //单击选项后改变选中状态(并加载相应页面)
    $('#left-content').on('click', 'a.a-result', function () {
        $("#left-content > li > a").removeClass('active');
        $(this).addClass('active');
        LoadPage($(this).attr('src'));
    });

    //初始化为点击第一个
    $("#left-content > li:nth-child(2) > a").click();
    //logo绑定事件
    $('#logo').on('click', function () {
        LoadPage("myself.html");
    });

    //注销
    $('#Logout').on('click',function () {
        Logout()
    })
});

function Init() {
    switch (auth) {
        case 6:
            $('#left-content').append('<li class="sidebar-nav-heading">Marker' +
                '<span class="sidebar-nav-heading-info"> 标注员</span></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="myself.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-user sidebar-nav-link-logo"></i> 个人信息</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="audios.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-table sidebar-nav-link-logo"></i> 标注列表</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="#" id="audio-ing">' +
                '<i class="am-icon-pencil sidebar-nav-link-logo"></i> 进行标注</a></li>');

            break;
        case 5:
            $('#left-content').append('<li class="sidebar-nav-heading">Inspector' +
                '<span class="sidebar-nav-heading-info"> 质检员</span></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="myself.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-user sidebar-nav-link-logo"></i> 个人信息</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="audios.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-table sidebar-nav-link-logo"></i> 质检列表</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="#" id="audio-ing">' +
                '<i class="am-icon-pencil sidebar-nav-link-logo"></i> 进行质检</a></li>');

            break;
        case 4:
            $('#left-content').append('<li class="sidebar-nav-heading">Checker' +
                '<span class="sidebar-nav-heading-info"> 验收员</span></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="myself.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-user sidebar-nav-link-logo"></i> 个人信息</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="projects.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-table sidebar-nav-link-logo"></i> 项目管理</a></li>');


            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="audios.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-table sidebar-nav-link-logo"></i> 验收列表</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="#" id="audio-ing">' +
                '<i class="am-icon-pencil sidebar-nav-link-logo"></i> 进行验收</a></li>');

            break;
        case 1:
            $('#left-content').append('<li class="sidebar-nav-heading">Boss' +
                '<span class="sidebar-nav-heading-info"> 平台管理员</span></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="myself.html" src="javascript:0" target="iframe-right" class="a-result">' +
                '<i class="am-icon-user sidebar-nav-link-logo"></i> 个人信息</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="people.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-users sidebar-nav-link-logo"></i> 人员管理</a></li>');


            // $('#left-content').append('<li class="sidebar-nav-link">' +
            // 	'<a src="setpage.html" target="iframe-right" class="a-result">' +
            // 	'<i class="am-icon-cog sidebar-nav-link-logo"></i> 设置</a></li>');
            break;

        case 2:
            $('#left-content').append('<li class="sidebar-nav-heading">Channel Admin' +
                '<span class="sidebar-nav-heading-info"> 渠道管理员</span></li>');

            // $('#left-content').append('<li class="sidebar-nav-link">' +
            // 	'<a src="myself.html" target="iframe-right" class="a-result">' +
            // 	'<i class="am-icon-info sidebar-nav-link-logo"></i> 信息概览</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="myself.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-user sidebar-nav-link-logo"></i> 个人信息</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="people.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-users sidebar-nav-link-logo"></i> 人员管理</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="projects.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-table sidebar-nav-link-logo"></i> 项目管理</a></li>');

            // $('#left-content').append('<li class="sidebar-nav-link">' +
            //     '<a src="setpage.html" target="iframe-right" class="a-result">' +
            //     '<i class="am-icon-cog sidebar-nav-link-logo"></i> 设置比例</a></li>');

            break;
        case 3:
            $('#left-content').append('<li class="sidebar-nav-heading">Project Manager' +
                '<span class="sidebar-nav-heading-info"> 项目经理</span></li>');

            // $('#left-content').append('<li class="sidebar-nav-link">' +
            // 	'<a src="myself.html" target="iframe-right" class="a-result">' +
            // 	'<i class="am-icon-info sidebar-nav-link-logo"></i> 信息概览</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="myself.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-user sidebar-nav-link-logo"></i> 个人信息</a></li>');

            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="people.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-users sidebar-nav-link-logo"></i> 人员管理</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="channel.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-odnoklassniki sidebar-nav-link-logo"></i> 渠道管理</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="projects.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-table sidebar-nav-link-logo"></i> 项目管理</a></li>');
            $('#left-content').append('<li class="sidebar-nav-link">' +
                '<a src="audioChar.html" target="iframe-right" class="a-result">' +
                '<i class="am-icon-smile-o sidebar-nav-link-logo"></i> 表情库</a></li>');

            // $('#left-content').append('<li class="sidebar-nav-link">' +
            // 	'<a src="setpage.html" target="iframe-right" class="a-result">' +
            // 	'<i class="am-icon-cog sidebar-nav-link-logo"></i> 设置比例</a></li>');

            break;

    }
}

function Logout() {
    // console.log(token+account);
    localStorage.removeItem("nowUser");
    localStorage.removeItem("token");
    window.location.href = "login.html";

    // $.ajax({
    //     url: baseUrl + "apiuser/account",
    //     type: "DELETE",
    //     headers: {
    //         "Content-type": "application/json; charset=utf-8",
    //         "x_hztz_token":token
    //     },
    //     data:JSON.stringify({
    //         "account":account,
    //         "token":token
    //     }),
    //     success: function (res) {
    //         console.log(res);
    //         if (res.state==0) {
    //             localStorage.removeItem("token");
    //             localStorage.removeItem("nowUser");
    //             window.location.href = "login.html";
    //         } else {
    //             alert("注销失败！");
    //         }
    //     },
    //     error:function () {
    //         localStorage.removeItem("token");
    //         localStorage.removeItem("nowUser");
    //         window.location.href = "login.html";
    //         alert("网络错误！");
    //     }
    // });

}

function setIframeHeight() {
    var iframe = document.getElementById('load-page');
    if (iframe) {
        var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
        if (iframeWin.document.body) {
            iframe.height = iframeWin.document.body.scrollHeight || iframeWin.document.documentElement.scrollHeight;
        }

    }
};

var load_data;
//设置昵称
function setName(name) {
    $("#user-name").text(name);
}


function LoadPage(page, data) {
    load_data = data;
    $("#load-page")[0].src = page;
    if ($("#left-content > li > a[href='" + page + "']").length > 0) {
        $("#left-content > li > a").removeClass('active');
        $("#left-content > li > a[href='" + page + "']").addClass('active');
    }

}

/**
 * {音频操作中}
 */
function audioActive() {
    $("#left-content li a").removeClass('active');
    $('#left-content').find('#audio-ing').addClass('active');
}

var markstate;//判断标注员是申请新音频还是继续做旧音频
var AudioId = -1;//存储当前继续操作的音频id