//testpart

var account = window.parent.account;
var name = window.parent.auth_info.name;
var token = window.parent.token;

//获取权限变量
var auth = window.parent.auth;
var baseUrl = window.parent.baseUrl;
//初始化
var table;
$(document).ready(function () {

    //初始化权限
    Init_auth();

    //初始化表格
    table = $('#table').DataTable({
        responsive: true,
        "pageLength": 10,
        "dom": 'rt<"bottom"p><"clear">',
        "order": [
            [2, 'asc']
        ]
    });

    //过滤器配置
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var vals = $('#audio-fliter').val().split(',');
            if (vals.indexOf('-1') != -1)
                return true;

            var state = table.row(dataIndex).data()[1];
            var result = /.*state="(.*)".*/.exec(state)[1];
            if (vals.indexOf(result) == -1)
                return false;
            return true;
        });

    // GetListFromServer();

    //模拟添加数据
    //	for(var i = 0; i < 100; i++) {
    //		AddListForChecker('project-0' + i, Math.floor(Math.random()*8),'2018-11-'+Math.floor(Math.random()*8+1),'小明');
    //	}

    //进行搜索
    $('#search-button').on('click', function () {

        table.search($('#search-input').val()).draw();

    });

    //进行过滤
    $("#audio-fliter").on('change', function () {
        table.search($('#search-input').val()).draw();
    });
    //加载初始数据
    LoadStartingInfo();

    //加载完成后显示
    $("#audio-all").show();

    // 开始新的标注/质检/验收
    $('#audio-button-group').on('click', function () {
        openModel('#select-modal', true);
    })

    //wait
    $('input[type="radio"]').on('click', function () {
        $('#projectList').empty();
        switch ($(this).val()) {
            case 'BIG_AUDIO':
                if (projectsData != null) {
                    projectsData.forEach(function (key) {
                        if (key.projectType == "BIG_AUDIO") {
                            $('#projectList').append('<option value="' + key.num + '">' + key.name + '</option>');
                        }
                    })
                }
                break;
            case 'SMALL_AUDIO':
                if (projectsData != null) {
                    projectsData.forEach(function (key) {
                        if (key.projectType == "SMALL_AUDIO") {
                            $('#projectList').append('<option value="' + key.num + '">' + key.name + '</option>');
                        }
                    })
                }
                break;
        }
        $("#projectList").selected('destroy');
        $("#projectList").selected({
            btnWidth: '30%',
            btnSize: 'sm',
            btnStyle: 'primary'
        })
        //加载对应的项目到下拉框中
    })
    //开始新的标注/质检/验收
    $('#sure-select').on('click', function () {
        //wait
        var projectNum = $('#projectList').val();
        // console.log(projectNum);
        // console.log(auth);
        sessionStorage.setItem("audioPro",projectNum);
        $.ajax({
        	url: baseUrl + 'apiproject/task/' + account,
        	type: "POST",
        	headers: {
        		"Content-type": "application/json; charset=utf-8",
        		"x_hztz_token": token
        	},
        	data:JSON.stringify({
        		"projectNum":projectNum
        	}),
        	success: function (res) {
        		// console.log(res);
        		if (res.state) {
                    window.parent.goOn=true;
                    window.parent.originAudios=res.originAudios;
                    window.parent.AudioId=res.originAudios[0].audioId;
        			sessionStorage.setItem("projectNum",projectNum);
        			sessionStorage.setItem("taskId",res.taskId);
        			switch (auth) {
        				case 6:
                            sessionStorage.setItem("proportion",res.proportion);
                            window.parent.LoadPage("markAudio.html");
        					break;
        				case 5:
                            sessionStorage.setItem("proportion",res.proportion);
                            window.parent.LoadPage("checkAudio.html");
        					break;
                        case 4:
                            sessionStorage.setItem("proportion",res.proportion);
                            window.parent.LoadPage("checkAudio.html");
                            break;
                        default:
                            break;
        				// case 4:
        				// 	window.parent.LoadPage("markAudio.html");
        				// 	break;
        			}
        			// console.log(data);
        		} else {
        			alert("当前有任务正在进行或者此项目没有可获取任务");
        		}
        	},
        	error: function () {
        		alert("连接失败");
        	}
        });

        // switch (auth) {
        // 	case 4:
        // 	StartFinalChecker();
        // 		break;
        // 	case 5:
        // 	StartChecker();
        // 	break;
        // 	case 6:
        // 		StartNewMark();
        // 	break;
        // 	default:
        // 		break;
        // }
    })
});
//testpart
var testData = {
    "projectList": [
        {
            "num": 1,
            "name": "pro1",
            "projectType": "BIG_AUDIO",
        },
        {
            "num": 2,
            "name": "pro2",
            "projectType": "BIG_AUDIO",
        },
        {
            "num": 3,
            "name": "pro3",
            "projectType": "SMALL_AUDIO",
        },
        {
            "num": 4,
            "name": "pro4",
            "projectType": "SMALL_AUDIO",
        }
    ],
    tasks: [
        {
            "id": 123,
            "originAudioVOList": [
                "1"
            ]
        },
        {
            "id": 456,
            "originAudioVOList": [
                "2"
            ]
        },
        {
            "id": 789,
            "originAudioVOList": [
                "3"
            ]
        }
    ]
}

//拿到的项目列表数据
var projectsData = null;

function LoadStartingInfo() {

    $('#projectList').empty();
    //获取项目列表
    $.ajax({
        url: baseUrl + 'apiproject/all/' + account,
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        type: 'GET',
        success: function (res) {
            //得到projectsData数据
            // console.log(res);
            projectsData=res.projects;
            //填充项目列表数据
            switch ($('input[type="radio"]:checked').val()) {
                case 'BIG_AUDIO':
                    if (projectsData != null) {
                        projectsData.forEach(function (key) {
                            if (key.projectType == "BIG_AUDIO") {
                                $('#projectList').append('<option value="' + key.num + '">' + key.name + '</option>');
                            }
                        })
                    }
                    break;
                case 'SMALL_AUDIO':
                    if (projectsData != null) {
                        projectsData.forEach(function (key) {
                            if (key.projectType == "SMALL_AUDIO") {
                                $('#projectList').append('<option value="' + key.num + '">' + key.name + '</option>');
                            }
                        })
                    }
                    break;
            }
            $("#projectList").selected('destroy');
            $("#projectList").selected({
                btnWidth: '30%',
                btnSize: 'sm',
                btnStyle: 'primary'
            })
        },
        error: function () {
            alert('网络错误');
        }
    });

    //获取任务列表
    $.ajax({
        url: baseUrl + 'apiproject/task/all/' + account,
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        type: 'GET',
        success: function (res) {
            //得到projectsData数据
            // console.log(res);
            var tasks=res.data;
            if(tasks.length==0){
                return;
            }
            var $taskStatus=new Array();
            $taskStatus['NOT_ACQUIRED']=0;
            $taskStatus['IN_ANNOTATING']=1;
            $taskStatus['NO_QS']=2;
            $taskStatus['IN_QS']=3;
            $taskStatus['NOT_INSPECTING']=5;
            $taskStatus['IN_INSPECTING']=6;
            $taskStatus['CHECK_ACCEPTED']=8;
            $taskStatus['QS_BACK']=4;
            $taskStatus['INSPECTOR_BACK']=7;

            switch (auth) {
                case 6:
                    tasks.forEach(function (key) {
                        AddListForMark(key.taskId,$taskStatus[key.status],formatStringDate(key.date));
                    });
                    break;
                case 5:
                    tasks.forEach(function (key) {
                        AddListForChecker(key.taskId,$taskStatus[key.status],formatStringDate(key.date));
                    });
                    break;
                case 4:
                    tasks.forEach(function (key) {
                        AddListForFinalChecker(key.taskId,$taskStatus[key.status],formatStringDate(key.date));
                    });
                    break;
                default:break;
            }

        },
        error: function () {
            alert('网络错误');
        }
    });


}
/*
 *格式化字符串日期
 */
function formatStringDate(date) {
    return date.substr(0,4)+"-"+date.substr(4,2)+"-"+date.substr(6,2)+" "+date.substr(8,2)+":"+date.substr(10,2)+":"+date.substr(12,2);
}


function GetListFromServer() {
    switch (auth) {
        case 4:

            for (let i = 0; i < 100; i++) {
                AddListForFinalChecker(i, i % 9, '2019/01/03 12:44:4' + i);
            }

            break;
        case 5:
            for (let i = 0; i < 100; i++) {
                AddListForChecker(i, i % 9, '2019/01/03 12:44:4' + i);
            }

            break;
        case 6:
            for (let i = 0; i < 100; i++) {
                AddListForMark(i, i % 9, '2019/01/03 12:44:4' + i);
            }
            break;
        default:
            break;
    }
    return;
}

//初始化
function Init_auth() {
    $("#audio-fliter").empty();
    $("#table-head").empty();
    $("#audio-button-group").empty();
    $("#table-head").append('<th>任务ID</th><th>状态</th><th>获取时间</th><th>操作</th>');

    switch (auth) {
        case 4:
            $("#audio-fliter").append('<option value="-1">所有</option>');
            $("#audio-fliter").append('<option value="6">待提交</option>');
            $("#audio-fliter").append('<option value="7">不合格</option>');
            $("#audio-fliter").append('<option value="8">已完成</option>');


            $("#audio-button-group").append('<button type="button" class="am-btn am-btn-success" >开始新的验收</button>')

            break;
        case 5:
            $("#audio-fliter").append('<option value="-1">所有</option>');
            $("#audio-fliter").append('<option value="2,3">待提交</option>');
            $("#audio-fliter").append('<option value="4,7">不合格</option>');
            $("#audio-fliter").append('<option value="5,6">待验收</option>');
            $("#audio-fliter").append('<option value="8">已完成</option>');
            $("#audio-button-group").append('<button type="button" class="am-btn am-btn-success am-btn-sm" >开始新的质检</button>')

            break;
        case 6:
            $("#audio-fliter").append('<option value="-1">所有</option>');
            $("#audio-fliter").append('<option value="1">待提交</option>');
            $("#audio-fliter").append('<option value="2,3,5,6">待审核</option>');
            $("#audio-fliter").append('<option value="4,7">不合格</option>');
            $("#audio-fliter").append('<option value="8">已完成</option>');


            $("#audio-button-group").append('<button type="button" class="am-btn am-btn-success">开始新的标注</button>')
            break;
    }

}


//获取状态文本
function GetStateStr(state) {
    var str_state = '未知状态';
    switch (state) {
        case 0:
            str_state = '未获取';
            break;
        case 1:
            str_state = '标注中';
            break;
        case 2:
            str_state = '待质检';
            break;
        case 3:
            str_state = '质检中';
            break;
        case 4:
            str_state = '质检打回';
            break;
        case 5:
            str_state = '待验收';
            break;
        case 6:
            str_state = '验收中';
            break;
        case 7:
            str_state = '验收打回';
            break;
        case 8:
            str_state = '验收合格';
            break;
    }
    return '<div class="" state="' + state + '">' + str_state + '</div>';
}

/**
 * 向标注员任务表格添加内容
 * @param {Number} id 任务id
 * @param {Number} state 任务状态
 * @param {Date} time 最后操作时间
 */
function AddListForMark(id, state, time) {
    var str_state = GetStateStr(state);

    var button = '<td><div class="tpl-table-black-operation">' +
        '<a href="javascript:;" class="tpl-table-black-operation"><i class="am-icon-check am-icon-fw"></i></i> 不可操作</a></div></td></tr>';
    if (state == 1 || state == 2 || state == 4 || state == 7)
        button = '<td><div class="tpl-table-black-operation">' +
            '<a href="javascript:ContinueMarkAudio(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-pencil"></i> 继续标注</a></div></td></tr>';

    var rowNode = table
        .row.add([
            id,
            str_state,
            time,
            button
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');
}

/**
 * 向质检任务表格添加内容
 * @param {Number} id 任务id
 * @param {Number} state 任务状态
 * @param {Date} time 最后操作时间
 */
function AddListForChecker(id, state, time) {
    var str_state = GetStateStr(state);

    var button = '<td><div class="tpl-table-black-operation">' +
        '<a href="javascript:;" class="tpl-table-black-operation"><i class="am-icon-info am-icon-fw"></i></i> 无可用操作</a></div></td></tr>';
    if (state == 3||state ==2)
        button = '<td><div class="tpl-table-black-operation">' +
            '<a href="javascript:ContinueStartChecker(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-pencil"></i> 继续质检</a></div></td></tr>';

    var rowNode = table
        .row.add([
            id,
            str_state,
            time,
            button
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');
}

/**
 * 向验收员任务表格添加内容
 * @param {Number} id 任务id
 * @param {Number} state 任务状态
 * @param {Date} time 最后操作时间
 */
function AddListForFinalChecker(id, state, time) {
    var str_state = GetStateStr(state);

    var button = '<td><div class="tpl-table-black-operation">' +
        '<a href="javascript:;" class="tpl-table-black-operation"><i class="am-icon-check am-icon-fw"></i></i> 无可用操作</a></div></td></tr>';
    if (state == 6||state == 5)
        button = '<td><div class="tpl-table-black-operation">' +
            '<a href="javascript:ContinueStartFinalChecker(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-pencil"></i> 继续验收</a></div></td></tr>';

    var rowNode = table
        .row.add([
            id,
            str_state,
            time,
            button
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');
}

// 页面跳转

function StartNewMark() {
    console.log('开始新标注');
    window.parent.markstate = 1;
    // console.log(window.parent.markstate);
    window.parent.audioActive();
    window.parent.LoadPage("markAudio.html?state=1");
}

function StartChecker() {
    console.log('开始质检');
    console.log(1);
    window.parent.markstate = 1;
    window.parent.audioActive();
    window.parent.LoadPage("checkAudio.html?state=1");
}

function ContinueStartChecker(id) {
    // console.log('继续质检' + id);
    // window.parent.markstate = 0;
    // window.parent.audioActive();
    changeTaskState(id,5);
    $.ajax({
        url: baseUrl + 'apiproject/taskinfo/' + id,
        type: "GET",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        success: function (res) {
            // console.log(res);
            if (res.state) {
                window.parent.goOn=true;
                window.parent.originAudios=res.originAudios;
                window.parent.AudioId=res.originAudios[0].audioId;
                sessionStorage.setItem("audioPro",res.originAudios[0].projectNum);
                sessionStorage.setItem("taskId",id);
                sessionStorage.setItem("proportion",res.proportion);
                switch (auth) {
                    case 5:
                        window.parent.LoadPage("checkAudio.html");
                        break;
                    default:
                        break;
                }
            } else {
                alert("任务状态异常,请联系管理员");
            }
        },
        error: function () {
            alert("连接失败");
        }
    });

}

/**
 * 更改任务状态
 */
function changeTaskState(taskId,state) {
    $.ajax({
        url: baseUrl + 'apiproject/task/'+account,
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        type: 'PUT',
        data:JSON.stringify({
            "action":state,
            "taskId":taskId
        }),
        success: function (res) {
            if (res.state){
                // window.parent.LoadPage("audios.html");
            }
        },
        error: function () {
            alert('网络错误');
        }
    });
}

function StartFinalChecker() {
    console.log('开始验收');
    window.parent.markstate = 1;
    window.parent.audioActive();
    window.parent.LoadPage("checkAudio.html?state=1");
}

function ContinueStartFinalChecker(id) {
    // console.log('继续验收' + id);
    // window.parent.markstate = 0;
    window.parent.audioActive();
    changeTaskState(id,6);

    // window.parent.LoadPage("checkAudio.html?state=0");
    $.ajax({
        url: baseUrl + 'apiproject/taskinfo/' + id,
        type: "GET",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        success: function (res) {
            // console.log(res);
            if (res.state) {
                window.parent.goOn=true;
                window.parent.originAudios=res.originAudios;
                window.parent.AudioId=res.originAudios[0].audioId;
                sessionStorage.setItem("audioPro",res.originAudios[0].projectNum);
                sessionStorage.setItem("taskId",id);
                sessionStorage.setItem("proportion",res.proportion);
                switch (auth) {
                    case 4:
                        window.parent.LoadPage("checkAudio.html");
                        break;
                    default:
                        break;
                }
            } else {
                alert("任务状态异常,请联系管理员");
            }
        },
        error: function () {
            alert("连接失败");
        }
    });

}

function ContinueMarkAudio(id) {
    // console.log("继续标注");
    // console.log(id);
    $.ajax({
        url: baseUrl + 'apiproject/taskinfo/' + id,
        type: "GET",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        success: function (res) {
            // console.log(res);
            if (res.state) {
                window.parent.goOn=true;
                window.parent.originAudios=res.originAudios;
                window.parent.AudioId=res.originAudios[0].audioId;
                sessionStorage.setItem("audioPro",res.originAudios[0].projectNum);
                sessionStorage.setItem("taskId",id);
                switch (auth) {
                    case 6:
                        window.parent.LoadPage("markAudio.html");
                        break;
                    default:
                        break;
                }
                // console.log(data);
            } else {
                alert("任务状态异常,请联系管理员");
            }
        },
        error: function () {
            alert("连接失败");
        }
    });


    //获取音频id列表wait
    // $.ajax({
    // 	url: baseUrl + 'apiproject/all/' + account,
    // 	headers: {
    // 		"Content-type": "application/json; charset=utf-8",
    // 		"x_hztz_token": token
    // 	},
    // 	type: 'GET',
    // 	success: function (res) {
    // 		console.log(res);
    // 	},
    // 	error: function () {
    // 		alert('网络错误');
    // 	}
    // });
    // window.parent.markstate = 0;
    // window.parent.AudioId = id;
    // window.parent.audioActive();

    // console.log(window.parent.markstate);
    // window.parent.LoadPage("markAudio.html?state=0");
}

// 获取浏览器中的参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

/**
 * 关闭指定弹出层
 * @param {String} id 弹出层id
 */
function closeModel(id) {
    $(id).modal('close');
}

/**
 * 打开指定弹出层
 * @param {String} id 弹出层id
 * @param {boolean} close 设置点击遮罩层是否可以关闭
 */
function openModel(id, close) {
    $(id).modal({
        closeViaDimmer: close//设置点击遮罩层无法关闭
    });
    $(id).modal('open');
}