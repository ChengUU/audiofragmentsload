//var roleauto=3;
var baseUrl = window.parent.baseUrl;
//设置值权限
var roleauto = window.parent.auth;
var token = window.parent.token;
var useraccount = window.parent.account;
//渠道编号
var channelNum=null;

//接受后端传过来的数据
var userdata = null;
//设置表格
var table = null;
// 分配标注员表格
var table_markers = null;
//存放标注员数据
var markers = JSON.parse('[{"id":14,"name":"小明"},{"id":20,"name":"man4"},{"id":24,"name":"Myqudao"},{"id":28,"name":"newqudao"}]');
//存放行首的账号
var account = null;

$(document).ready(function () {
    //初始化表格
    Init_auth();
    table = $('#audio-table').DataTable({
        responsive: true,//是否是响应式？
        "pageLength": 10,//每页条数
        "dom": 'rt<"bottom"p><"clear">',//添加分页控件12004
        "order": [[2, 'asc']]//初始化排序是以那一列进行排序，并且，是通过什么方式来排序的，下标从0开始，‘’asc表示的是升序，desc是降序
    });

    table_markers = $('#markers-table').DataTable({
        responsive: true,//是否是响应式？
        "pageLength": 5,//每页条数
        "dom": 'rt<"bottom"p><"clear">'//添加分页控件12004
    });

    //过滤器配置（对于搜索框的配置，自定义筛选）
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var vals = $('#audio-fliter').val().split(',');
            if (vals.indexOf('-1') != -1)// indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
                return true;
            var state = table.row(dataIndex).data()[2];
            var result = /.*state="(.*)".*/.exec(state)[1];
            if (vals.indexOf(result) == -1)
                return false;
            return true;
        });

    // 从服务器获取数据
    connect();
    //进行搜索
    $('#search-button').on('click', function () {
        table.search($('#search-input').val()).draw();
    });


    //进行过滤
    $("#audio-fliter").on('change', function () {
        table.search($('#search-input').val()).draw();//表格的重新加载
    });

    // $("#audio-all").show();

    //注册添加事件
    /*批量增加*/
    MoreAdd();
    /*单个增加*/
    SingleAdd();

    /*单个删除*/
    $("#table-body").on('click', '.let', function () {
        var tables = $('#audio-table').DataTable();
        var data1 = tables.row($(this).parents('tr')).data();
        var getuser = data1[0];
        var $prompt = $('#my-confirm');
        var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
        var achieveOne = 1;//解决多次弹出删除失败

        console.log(getuser);
        var that =this;
        $confirmBtn.off('click.confirm.modal.amui').on('click', function () {

            if (achieveOne == 1)
                achieveOne = 0;
            else
                return;
            // console.log("test");
            $.ajax({
                url: baseUrl + "apiuser/account/" + useraccount,
                type: "DELETE",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "account": getuser
                }),
                success: function (res) {
                    if (res) {
                        alert("删除成功！");
                        tables.row($(that).parents('tr')).remove().draw();
                        // window.parent.LoadPage('backstage.html');
                    } else {
                        alert("删除失败");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        });
        //select(getuser);

        //alert(data[0]);
    });

    // 查看详请
    $("#table-body").on('click', '.detial', function () {
        var tables = $('#audio-table').DataTable();
        var data1 = tables.row($(this).parents('tr')).data();
        var checkid = data1[0];
        window.parent.CkdetialByid = checkid;
        window.parent.LoadPage('checkdetial.html');
    });


});
//质检与标注对应关系列表(标注查询依赖关系)
var qsNoterList=null;
//质检与标注对应关系列表(质检查询依赖关系)
var qsNoterList2=null;


/**
 * 设切换项目置标注员验收比例
 */
$('#projectList2').on('change',function () {
    $.ajax({
        url: baseUrl + "apichannel/member/relation/"+useraccount+"/"+$('#projectList2').val() ,
        type: "GET",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        success: function (res) {
            // console.log(res);
            qsNoterList=res;
        },
        error: function () {
            alert("网络错误");
        }
    })
});


/**
 * 标注员列表发生改变
 */
$('#markerList').on('change',function (e) {
    if(markerListVal==null||markerListVal.length==0)
        return;
    var nowVal=$(this).val();
    for (let i = 0; i <markerListVal.length; i++) {
        let flag=true;

        if(nowVal!=null){
            for (let j = 0; j <nowVal.length ; j++) {
                if(nowVal[j]==markerListVal[i]){
                    flag=false;
                    break;
                }
            }
        }

        if(flag){
            if(i==markerListVal.length)
                return;
            console.log(markerListVal[i]);
            //删除
            $.ajax({
                url: baseUrl + "apichannel/relation/"+useraccount,
                type: "DELETE",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data:JSON.stringify({
                    "projectNum": $('#projectList').val(),
                    "qs": account,
                    "noter":markerListVal[i]
                }),
                success: function (res) {
                    console.log(res);
                },
                error: function () {
                    alert("网络错误");
                }
            });
            markerListVal.splice(i,1);
            break;
        }
    }
});

/**
 * 标注员列表当前选中值
 * @type {null}
 */
var markerListVal=null;

/**
 * 切换项目获取最新的对应列表数据
 */
$('#projectList').on('change',function () {
    $.ajax({
        url: baseUrl + "apichannel/member/relation/"+useraccount+"/"+$('#projectList').val() ,
        type: "GET",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        success: function (res) {
            // console.log(res);
            qsNoterList2=res;
            //刷新数据
            var list=new Array();
            //查询质检已经拥有的标注员
            for (let i = 0; i <qsNoterList2.length ; i++) {
                var flag=false;
                if(account==qsNoterList2[i].qs.account){
                    flag=true;
                    for (let j = 0; j <qsNoterList2[i].noterList.length ; j++) {
                        list.push(qsNoterList2[i].noterList[j].account);
                    }
                }
                if(flag){
                    break;
                }
            }

            // console.log(list);
            ChangeMarkers(list);

        },
        error: function () {
            alert("网络错误");
        }
    })
});


/**
 *为质检员分配标注员
 */
$('#table-body').on('click', '.ed-distribute', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];
    var list=new Array();
    //查询质检已经拥有的标注员
    for (let i = 0; i <qsNoterList2.length ; i++) {
        var flag=false;
        if(account==qsNoterList2[i].qs.account){
            flag=true;
            for (let j = 0; j <qsNoterList2[i].noterList.length ; j++) {
                list.push(qsNoterList2[i].noterList[j].account);
            }
        }
        if(flag){
            break;
        }
    }

    // console.log(list);
    ChangeMarkers(list);
    //启动弹窗
    openModel('#doc-modal-distribute', false);

    //确定保存
    $("#saveDistribute").unbind('click');
    $("#saveDistribute").on('click',function (e) {

        $.ajax({
            url: baseUrl + "apichannel/member/relation/" + useraccount,
            type: "POST",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            data: JSON.stringify({
                "projectNum": $('#projectList').val(),
                "qs": account,
                "noterList":$('#markerList').val()
            }),
            success: function (res) {
                alert("保存成功");
                closeModel("#doc-modal-distribute");
            },
            error: function () {
                alert("网络错误");
            }
        })
    })

});

/**
 *查看绩效
 */
$('#table-body').on('click', '.ed-score', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];
    //初始化
    $('#proList').val('-1');
    $("#proList").selected('destroy');
    $("#proList").selected({
        btnStyle: 'secondary'
    })
    setTableScore("#table-score",0,0,0,0,0,0,0);

    //启动弹窗
    openModel('#doc-modal-score', true);

    //选择查看绩效的项目
    $('#proList').unbind('change');
    $('#proList').on('change', function () {
        const projectNum=$(this).val();
        if(projectNum==-1){
            return;
        }
        $.ajax({
            type: "GET",
            url: baseUrl + "apiuser/performance/"+account+"/"+projectNum,
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token":token
            },
            success: function (res) {
                if(res.code==200){
                    let score=res.data;
                    if(score==null){
                        setTableScore("#table-score",0,0,0,0,0,0,0);
                        return;
                    }
                    //向表中刷新数据
                    score.succEffectTime=(score.succEffectTime/(60*60)).toFixed(5);
                    score.effectTime=(score.effectTime/(60*60)).toFixed(5);
                    setTableScore("#table-score",score.succEffectTime,score.effectTime,score.checkBack,score.totalRec,score.noOperation,score.unSubmitted,score.noCheck);
                }
            },
            error: function () {
                alert("连接失败！");
            }
        });
    })
});

/**
 *更改验收比例
 */
$('#table-body').on('click', '.ed-proportion', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];
    changeModalMessage("验收比例", "请在此处输入验收比例(1-100)");

    $("#projectList2").parent().show();
    //启动弹窗
    openModel('#doc-modal-1', false);

    $('#sure-set').unbind('click');
    $('#sure-set').on('click', function (e) {
        var text = $('#ed-input').val();
        if (text == "" || text == null) {
            return;
        } else {
            //RegExp
            var rProportion = /^\d{1,3}$/;
            if (!rProportion.test(text)) {
                changeModalMessage("验收比例", "输入格式错误 Number:(1-100)");
                $('#ed-input').val("")
                return;
            } else if (text < 0 || text > 100) {
                changeModalMessage("验收比例", "输入格式错误 Number:(1-100)");
                $('#ed-input').val("")
                return;
            }
            var qs=null;
            for(let i=0;i<qsNoterList.length;i++){
                let flag=false;
                let noterList=qsNoterList[i].noterList;
                for(let j=0;j<noterList.length;j++){
                    if(noterList[j].account==account){
                        flag=true;
                    }
                }
                if(flag){
                    qs=qsNoterList[i].qs.account;
                    break;
                }
            }

            if(!qs){
                alert("没有分配质检员!!!");
                return;
            }
            //更改验收比例
            $.ajax({
                url: baseUrl + "apichannel/member/proportion/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "projectNum": $('#projectList2').val(),
                    "noter": account,
                    "proportion":text,
                    "qs":qs
                }),
                success: function (res) {
                    // console.log(res);
                    alert("更改成功");
                },
                error: function () {
                    alert("网络错误");
                }
            })
            // console.log(text + '\n' + account);
            //ajax
            //关闭弹出层
            closeModel('#doc-modal-1');
            $('#ed-input').val("")
        }
        e.stopPropagation();
    })
});

/**
 *更改权限(等待确定了多权限如何表示,再完善交互)
 */
$('#table-body').on('click', '.ed-power', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];

    var $checkArr = $('input[name="role-power"]');
    var $state = $(datas[2]);
    var nowpower = $state.attr('state');

    // if (nowstate == '0' || nowstate == 0) {
    // 	$radioArr.eq(1).uCheck('check');
    // } else {
    // 	$radioArr.eq(0).uCheck('check');
    // }
    //启动弹窗
    openModel('#doc-modal-power', false);
    $('#sure-set-power').unbind('click');
    $('#sure-set-power').on('click', function (e) {
        //获取到设置的状态
        var $newspower = $('input[name="role-power"]:checked');
        switch ($newspower.length) {//根据选中的个数
            case 0:
                console.log(0);
                break;
            case 1:

                console.log(1);
                break;
            case 2:
                console.log(2);
                break;
            default:
                break;
        }
        closeModel('#doc-modal-power');
        e.stopPropagation();
    })
});

/**
 *更改状态
 */
$('#table-body').on('click', '.ed-state', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];
    var $radioArr = $('input[name="radio-state"]');
    var $state = $(datas[3]);
    var nowstate = $state.attr('state');

    if (nowstate == '0' || nowstate == 0) {
        $radioArr.eq(1).uCheck('check');
    } else {
        $radioArr.eq(0).uCheck('check');
    }
    //启动弹窗
    openModel('#doc-modal-state', false);
    $('#sure-set-state').unbind('click');
    $('#sure-set-state').on('click', function (e) {
        //获取到设置的状态
        var newstate = $('input[name="radio-state"]:checked').val();
        if (nowstate == newstate) {
            console.log('same');
        } else {
            console.log(newstate + '\n' + account);
            //ajax
            var staffStatus = new Array();
            staffStatus[1] = "ACTIVE";
            staffStatus[0] = "FROZEN";
            $.ajax({
                url: baseUrl + "apiuser/account/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "account": account,
                    "staffStatus": staffStatus[Number(newstate)]
                }),
                success: function (res) {
                    if (res.state) {
                        alert("更改成功！");
                        //关闭弹出层
                        closeModel('#doc-modal-1');
                        $('#ed-input').val("")
                        RefreshPeo();
                    } else {
                        alert("失败,权限不足");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })

        }
        closeModel('#doc-modal-state');
        e.stopPropagation();
    })
});

/**
 *更改昵称
 */
$('#table-body').on('click', '.ed-nickname', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];
    changeModalMessage("昵称", "请在此处输入新的昵称");
    $("#projectList2").parent().hide();
    //启动弹窗
    openModel('#doc-modal-1', false);

    $('#sure-set').on('click', function (e) {
        var text = $('#ed-input').val();
        if (text == "" || text == null || text.length < 4 || text.length > 16) {
            alert("格式错误");
            return;
        } else {
            console.log(text + '\n' + account);
            //ajax
            $.ajax({
                url: baseUrl + "apiuser/account/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "account": account,
                    "name": text
                }),
                success: function (res) {
                    if (res.state) {
                        alert("更改成功！");
                        //关闭弹出层
                        closeModel('#doc-modal-1');
                        $('#ed-input').val("")
                        RefreshPeo();

                    } else {
                        alert("昵称已存在");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        }
        e.stopPropagation();
    })
});
/**
 *更改密码
 */
$('#table-body').on('click', '.ed-password', function () {
    var tempTable = $('#audio-table').DataTable();
    var datas = tempTable.row($(this).parents('tr')).data();
    account = datas[0];
    changeModalMessage("密码", "请在此处输入新的密码");
    //启动弹窗
    openModel('#doc-modal-1', false);

    $('#sure-set').on('click', function (e) {
        var text = $('#ed-input').val();
        if (text == "" || text == null || text.length < 6 || text.length > 16) {
            alert("密码格式不正确");
            return;
        } else {
            console.log(text + '\n' + account);
            //ajax更改密码
            $.ajax({
                url: baseUrl + "apiuser/account/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "account": account,
                    "password": text
                }),
                success: function (res) {
                    if (res.state) {
                        alert("更改成功！");
                        //关闭弹出层
                        closeModel('#doc-modal-1');
                        $('#ed-input').val("")
                    } else {
                        alert("更改失败");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })

        }
        e.stopPropagation();
    })
});

/**
 * 刷新分配标注员弹窗的数据
 * @param {NumberArry} Markers //已经给质检员分配的标注员的id组成的数组
 */
function ChangeMarkers(Markers) {
    markerListVal=Markers;
    $("#markerList").selected('destroy');
    $('#markerList').val(Markers);
    $('#markerList').selected({
        btnWidth: '100%',
        btnSize: 'sm',
        btnStyle: 'secondary',
        maxHeight: '100px'
    });
}


/**
 * 向分配标注员弹窗插入数据
 * @param {*} id //需要设置的标注员的id(如果要单独手动添加新的选择框 id的值需设置为null)
 */
function Add_Markers(id) {

    var input = '<div class="am-form-group"><select data-am-selected="{btnSize: \'sm\'}" class="markers-input"></select></div>'

    var button = '<button type="button" class="am-btn am-btn-danger am-btn-sm">删除</button>';

    var rowNode = table_markers
        .row.add([
            input,
            button
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');

    var select = $(rowNode).find("td > div > select")
    select.empty();
    for (var i = 0; markers != null && i < markers.length; i++) {
        if (id == markers[i]['id'])
            select.append('<option value="' + markers[i]['id'] + '">' + markers[i]['name'] + '</option>');
        else if (id == null) {
            select.append('<option value="' + markers[i]['id'] + '">' + markers[i]['name'] + '</option>');
        }
    }
    select.val(id);

}

/**
 * 刷新绩效弹窗数据
 * @param {String} tableid //质检/标注总览table对应的id(待#号)
 * @param{Number} finishValTime
 * @param {Number} finish //已完成数目
 * @param {Number} valTime    //有效时长
 * @param {Number} noPass    //打回次数
 * @param {Number} editWait    //待修改
 * @param {Number} pushWait    //待提交
 * @param {Number} reviewWait    //待审核
 */
function setTableScore(tableid,finishValTime, valTime, noPass,finish, editWait, pushWait, reviewWait) {
    var $tableScore = $(tableid);
    var $tbody = $tableScore.children('tbody');
    var $tdArr = $tbody.find('tr td');
    $tdArr.eq(0).html(finishValTime);
    $tdArr.eq(1).html(valTime);
    $tdArr.eq(2).html(noPass);
    $tdArr.eq(3).html(finish);
    $tdArr.eq(4).html(editWait);
    $tdArr.eq(5).html(pushWait);
    $tdArr.eq(6).html(reviewWait);
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

/**
 * 更改基本信息维护弹出框的标题与提示
 * @param {String} title 编辑栏标题
 * @param {String} placeholder 输入框提示
 */
function changeModalMessage(title, placeholder) {
    $("#ed-title").html(title);
    $("#ed-input").attr("placeholder", placeholder);
}


//连接后台
function connect() {

    //获取项目列表
    $.ajax({
        url: baseUrl + 'apiproject/all/' + useraccount,
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        type: 'GET',
        success: function (res) {
            // console.log(res);
            projectsData=res.projects;
            projectsData.forEach(function (key) {
                $('#proList').append('<option value="' + key.num + '">' + key.name + '</option>');
            })
            $("#proList").selected('destroy');
            $("#proList").selected({
                btnStyle: 'secondary'
            })
        },
        error: function () {
            alert('网络错误');
        }
    });

    //清空原选项
    $('#markerList').empty();
    // console.log(roleauto);
    if (roleauto!=2) {
        $.ajax({
            url: baseUrl + 'apiuser/accounts/all/' + useraccount,
            type: "GET",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            success: function (res) {
                if (res.state) {
                    var data = res.userVOList;
                    var power = new Array();
                    power["BOSS"] = 1;
                    power["PROJECT_MANAGER"] = 3;
                    power["CHANNEL_MANAGER"] = 2;
                    power["PROJECT_INSPECTOR"] = 4;
                    power["PROJECT_NOTER"] = 6;
                    power["PROJECT_QS"] = 5;
                    var staffStatus = new Array();
                    staffStatus["ACTIVE"] = 1;
                    staffStatus["FROZEN"] = 0;

                    for (var i = 0; i < data.length; i++) {
                        AddListForUser(data[i].account, data[i].name, power[data[i].characterType], staffStatus[data[i].staffStatus]);
                    }
                } else {
                    alert("没有权限");
                    window.parent.LoadPage("myself.html");
                }
            },
            error: function () {
                alert("连接失败");
                // switch (roleauto) {
                //     case 1:
                //         AddListForUser(10086, "小猴子", 4, 1);
                //         AddListForUser(10010, "小猴子", 3, 0);
                //         break;
                //     case 2:
                //         AddListForUser(10086, "小猴子", 5, 1);
                //         AddListForUser(10010, "小猴子", 6, 0);
                //         break;
                //     case 3:
                //         AddListForUser(10086, "小猴子", 2, 1);
                //         AddListForUser(10010, "小猴子", 2, 0);
                //         break;
                //     default:
                //         break;
                // }

            }
        });
    }else{
        $.ajax({
            url: baseUrl + 'apiuser/accounts/all/' + useraccount,
            type: "GET",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            success: function (res) {
                if (res.state) {
                    var data = res.userVOList;
                    var power = new Array();
                    power["BOSS"] = 1;
                    power["PROJECT_MANAGER"] = 3;
                    power["CHANNEL_MANAGER"] = 2;
                    power["PROJECT_INSPECTOR"] = 4;
                    power["PROJECT_NOTER"] = 6;
                    power["PROJECT_QS"] = 5;
                    var staffStatus = new Array();
                    staffStatus["ACTIVE"] = 1;
                    staffStatus["FROZEN"] = 0;

                    for (var i = 0; i < data.length; i++) {
                        AddListForUser(data[i].account, data[i].name, power[data[i].characterType], staffStatus[data[i].staffStatus]);
                        // console.log(power[data[i].characterType]);
                        if(power[data[i].characterType]==6){
                            $('#markerList').append('<option value="'+data[i].account+'">'+data[i].name+'</option>');
                        }
                    }
                } else {
                    alert("没有权限");
                    window.parent.LoadPage("myself.html");
                }
            },
            error: function () {
                alert("连接失败");
                // switch (roleauto) {
                //     case 1:
                //         AddListForUser(10086, "小猴子", 4, 1);
                //         AddListForUser(10010, "小猴子", 3, 0);
                //         break;
                //     case 2:
                //         AddListForUser(10086, "小猴子", 5, 1);
                //         AddListForUser(10010, "小猴子", 6, 0);
                //         break;
                //     case 3:
                //         AddListForUser(10086, "小猴子", 2, 1);
                //         AddListForUser(10010, "小猴子", 2, 0);
                //         break;
                //     default:
                //         break;
                // }

            }
        });
    }

    if(roleauto!=1){
        //获取渠道列表
        $.ajax({
            url: baseUrl + 'apichannel/all/' + useraccount,
            type: "GET",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            success: function (res) {
                if (res.state) {
                    var data = res.channelVOList;
                    // console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        if(useraccount==data[i].manager){
                            channelNum=data[i].num;
                            // console.log(channelNum);
                            break;
                        }
                    }
                } else {
                    alert("没有权限,获取渠道列表");
                }
            },
            error: function () {
                alert("连接失败");
            }
        })

        //获取项目列表
        $.ajax({
            url: baseUrl + 'apiproject/all/' + useraccount,
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            type: 'GET',
            success: function (res) {
                // console.log(res);
                if (res.state) {
                    projectList = res.projects;

                    var projectStatus = new Array();
                    projectStatus["FINISHED"] = 0;
                    projectStatus["ONGOING"] = 1;
                    projectStatus["PAUSE"] = 2;
                    projectStatus["WAITING"] = 3;

                    $('#projectList').empty();
                    $('#projectList2').empty();
                    for (var i = 0; i < projectList.length; i++){
                        $('#projectList').append('<option value="'+projectList[i].num+'">'+projectList[i].name+'</option>');
                        $('#projectList2').append('<option value="'+projectList[i].num+'">'+projectList[i].name+'</option>');
                    }
                    $('#projectList').selected('destroy');
                    $('#projectList').selected({
                        btnWidth: '40%',
                        btnSize: 'sm',
                        btnStyle: 'primary',
                        maxHeight: '100px'
                    });
                    // Add(projectList[i].num, projectList[i].name, projectStatus[projectList[i].projectStatus], projectList[i].date.substr(0, 12), projectList[i].projectType);

                } else {
                    alert('没有权限');
                    return;
                }

            },
            error: function () {
                alert('网络错误');
            }
        });
    }




}

/**
 * 刷新人员列表数据
 * @constructor
 */
function RefreshPeo() {
     window.parent.LoadPage("people.html");
}

function MoreAdd() {
    /*批量增加*/
    //data-am-modal-confirm
    var $prompt = $('#my-prompt');
    var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
    pclear($("#p-qian"), $("#p-cum"), $("#p-password"));
    $confirmBtn.off('click.confirm.modal.amui').on('click', function (e) {
        // do something
        var more = 1;
        var qian = $("#p-qian").val();
        var sum = $("#p-cum").val();
        var role = $("#p-role").val();
        var password = $("#p-password").val();
        var num = /^[A-Za-z0-9]+$/;
        var pre = /^[A-Za-z]+$/;
        if (sum == '' || password == '' || qian == '') {
            alert("请输入数量或初始密码或前缀");
            e.stopPropagation();
            return;//阻止事件扩散到父类
        } else {
            //得用正则表达式来判断密码的格式是否正确
            if (sum >= 2 && sum <= 99 && password.length >= 6 && password.length <= 12 && qian.length >= 3 && qian.length <= 24 ) {
                var power = new Array();
                power[1] = "BOSS";
                power[3] = "PROJECT_MANAGER";
                power[2] = "CHANNEL_MANAGER";
                power[4] = "PROJECT_INSPECTOR";
                power[6] = "PROJECT_NOTER";
                power[5] = "PROJECT_QS";
                var characterType = power[role];
                if (role != 5 && role != 6) {
                    $.ajax({
                        url: baseUrl + "apiuser/accounts/add/" + useraccount,
                        type: "POST",
                        headers: {
                            "Content-type": "application/json; charset=utf-8",
                            "x_hztz_token": token
                        },
                        data: JSON.stringify({
                            "name": qian,
                            "password": password,
                            "characterType": characterType,
                            "count": sum
                        }),
                        success: function (res) {
                            if(res.state==999){
                                alert("位置错误");
                                return;
                            }

                            if (res.state) {
                                alert("成功添加:" + res.success + "个");
                                window.parent.LoadPage('people.html');
                            } else {
                                alert("某些成员已存在");
                            }
                        },
                        error: function () {
                            alert("网络错误");
                        }
                    })
                }
                else{
                    $.ajax({
                        url: baseUrl + "apichannel/member/" + useraccount,
                        type: "POST",
                        headers: {
                            "Content-type": "application/json; charset=utf-8",
                            "x_hztz_token": token
                        },
                        data: JSON.stringify({
                            "channelNum":channelNum,
                            "name": qian,
                            "password": password,
                            "characterType": characterType,
                            "count": sum,
                            "proportion":100
                        }),
                        success: function (res) {
                            console.log(res);
                            alert("成功添加:" + res.length + "个");
                            window.parent.LoadPage('people.html');
                        },
                        error: function () {
                            alert("网络错误");
                        }
                    })
                }
            } else {
                alert("输入格式错误");
                e.stopPropagation();
            }
        }
    });


}

function pclear($a, $b, $c) {
    $a.val('');
    $b.val('');
    $c.val('');
}

function sclear($a, $b) {
    $a.val('');
    $b.val('');
}

function SingleAdd() {
    //单个增加
    var $myalert = $('#my-alert');
    var $myalertBtn = $myalert.find('[data-am-modal-confirm]');
    sclear($("#single-user"), $("#single-password"));
    //隐藏按钮
    if(roleauto==2){
        $('button.save').hide();
    }
    $myalertBtn.off('click.confirm.modal.amui').on('click', function (e) {
        // do something
        var Suser = $("#single-user").val();
        var Spassword = $("#single-password").val();
        if (Suser == '' || Spassword == '') {
            alert("请输入用户名或初始密码");
            e.stopPropagation();
            return;//阻止事件扩散到父类
        } else {
            //判断密码的格式是否正确
            if (Spassword.length >= 6 && Spassword.length <= 12 && Suser.length >= 2 && Suser.length <= 24) {

                var power = new Array();
                power[1] = "BOSS";
                power[3] = "PROJECT_MANAGER";
                power[2] = "CHANNEL_MANAGER";
                power[4] = "PROJECT_INSPECTOR";
                power[6] = "PROJECT_NOTER";
                power[5] = "PROJECT_QS";
                let role=$('#single-role').val();
                var characterType = power[role];
                if(role!=5&&role!=6){
                    $.ajax({
                        url: baseUrl + "apiuser/account/" + useraccount,
                        type: "POST",
                        headers: {
                            "Content-type": "application/json; charset=utf-8",
                            "x_hztz_token": token
                        },
                        data: JSON.stringify({
                            "name": Suser,
                            "password": Spassword,
                            "characterType": characterType
                        }),
                        success: function (res) {
                            if (res===true) {
                                alert("添加成功！");
                            } else {
                                alert("昵称已存在");
                            }
                        },
                        error: function () {
                            alert("网络错误");
                        }
                    })
                }else{
                    alert("标注员/质检员只能通过批量增加");
                }

            } else {
                alert("输入格式错误");
                e.stopPropagation();
            }
        }
    });
}

function Init_auth() {
    $("#audio-fliter").empty();//筛选框
    $("#table-head").empty();//行首
    $(".role").empty();//添加的角色选项
    switch (roleauto) {
        case 1:
            $("#audio-fliter").append('<option value="-1">所有</option>');
            $("#audio-fliter").append('<option value="4">验收员</option>');
            $("#audio-fliter").append('<option value="3">项目经理</option>');
            $("#table-head").append('<th>账号</th><th>昵称</th><th>角色</th><th>状态</th><th>常规操作</th>');
            $(".role").append('<option value="4">验收员</option>');
            $(".role").append('<option value="3">项目经理</option>');
            break;
        case 2:
            $("#audio-fliter").append('<option value="-1">所有</option>');
            $("#audio-fliter").append('<option value="5">质检员</option>');
            $("#audio-fliter").append('<option value="6">标注员</option>');
            $("#table-head").append('<th>账号</th><th>昵称</th><th>角色</th><th>状态</th><th>常规操作</th><th>高级操作</th>');
            $(".role").append('<option value="5">质检员</option>');
            $(".role").append('<option value="6">标注员</option>');
            break;
        case 3:
            $("#audio-fliter").append('<option value="-1">所有</option>');
            $("#audio-fliter").append('<option value="2">渠道管理员</option>');
            $("#table-head").append('<th>账号</th><th>昵称</th><th>角色</th><th>状态</th><th>常规操作</th>');
            $(".role").append('<option value="2">渠道管理员</option>');
            break;
    }
}


/**
 * 返回角色状态信息的div
 * @param {角色类型} role
 */
function GetState(state) {
    var str_state = "未知";
    var temp = '';
    switch (state) {
        case 1:
            str_state = "正常";
            temp = '<div class="role-state" style="	color: #5eb95e;" state="' + state + '">' + str_state + '</div>';
            break;
        case 0:
            str_state = "冻结";
            temp = '<div class="role-state" style="	color: #f35842;" state="' + state + '">' + str_state + '</div>';
            break;
    }

    return temp;
}

//获取状态文本
/**
 * 项目经理操作
 * 返回角色信息
 * @param {角色类型} role
 */
function GetRole(role) {
    var str_role = "未知角色";
    switch (role) {
        case 1:
            str_role = "平台管理员";
            break;
        case 2:
            str_role = "渠道管理员";
            break;
        case 5:
            str_role = "质检员";
            break;
        case 6:
            str_role = "标注员";
            break;
        case 3:
            str_role = "项目经理";
            break;
        case 4:
            str_role = "验收员";
            break;
    }
    return '<div class="role-type" state="' + role + '">' + str_role + '</div>';
}

function GetRole2(role) {
    var str_role = "未知角色";
    var sa = 0;
    // console.log(role);
    switch (role) {
        case 5:
            str_role = "质检员";
            sa = 5;
            break;
        case 4:
            str_role = "标注员";
            sa = 4;
            break;
    }
    return '<div class="" state="' + sa + '">' + str_role + '</div>';
}


/**
 * 向表格中添加人员数据
 * @param {String} id  用户名
 * @param {String} user 昵称
 * @param {String} role 角色
 * @param {String} state  状态
 */
function AddListForUser(id, user, role, state) {
    var str_role;	//角色信息
    var button1;		//常规操作列表的button
    var button2;	//高级操作列表button
    var str_state;  //状态信息
    var myconfirm = "'#my-confirm'";//删除按钮弹窗


    //判断上级是什么权限
    str_role = GetRole(role);//获取角色信息
    str_state = GetState(state);//获取状态信息
    switch (roleauto) {
        case 1:
            if (role == 4 || role == '4') {
                button1 = '<td><div class="tpl-table-black-operation">' +
                    '<a  class="ed-score table-btn-yellow am-margin-right-sm" href="javascript:;"> <i class="am-icon-pencil"></i> 绩效 </a>' +
                    '<a  class="ed-nickname table-btn-blue" href="javascript:;"> <i class="am-icon-pencil"></i> 昵称 </a> ' +
                    '<a  class="ed-state table-btn-green" href="javascript:;" ><i class="am-icon-leanpub"></i> 状态</a> ' +
                    '<a  class="ed-password" href="javascript:;"><i class="am-icon-leanpub"></i> 密码</a> ' +
                    '<a href="javascript:;"data-am-modal="{target:' + myconfirm + '}" class="tpl-table-black-operation-del let" ><i class="am-icon-trash"></i> 删除</a>' +
                    '</div></td>';
            } else {
                button1 = '<td><div class="tpl-table-black-operation">' +
                    '<a  class="ed-nickname table-btn-blue" href="javascript:;"> <i class="am-icon-pencil"></i> 昵称 </a> ' +
                    '<a  class="ed-state table-btn-green" href="javascript:;" ><i class="am-icon-leanpub"></i> 状态</a> ' +
                    '<a  class="ed-password" href="javascript:;"><i class="am-icon-leanpub"></i> 密码</a> ' +
                    '<a href="javascript:;"data-am-modal="{target:' + myconfirm + '}" class="tpl-table-black-operation-del let" ><i class="am-icon-trash"></i> 删除</a>' +
                    '</div></td>';
            }

            var rowNode = table
                .row.add([
                    id,
                    user,
                    str_role,
                    str_state,
                    button1
                ])
                .draw()
                .node();

            $(rowNode)
                .css('class', 'gradeX')
            break;
        case 2:
            button1 = '<td><div class="tpl-table-black-operation">' +
                '<a  class="ed-nickname table-btn-blue" href="javascript:;"> <i class="am-icon-pencil"></i> 昵称 </a> ' +
                '<a  class="ed-state table-btn-green" href="javascript:;" ><i class="am-icon-leanpub"></i> 状态</a> ' +
                '<a  class="ed-password" href="javascript:;"><i class="am-icon-leanpub"></i> 密码</a> ' +
                '<a href="javascript:;"data-am-modal="{target:' + myconfirm + '}" class="tpl-table-black-operation-del let" ><i class="am-icon-trash"></i> 删除</a>' +
                '</div></td>';
            if (role == 5 || role == "5") {/* 如果为质检员 */
                button2 = '<td><div class="tpl-table-black-operation">' +
                    '<a  class="ed-score table-btn-yellow am-margin-right-sm" href="javascript:;"> <i class="am-icon-pencil"></i> 绩效 </a> ' +
                    '<a  class="ed-distribute table-btn-lightgreen" href="javascript:;"><i class="am-icon-leanpub"></i> 分配</a> ' +
                    // '<a  class="ed-power table-btn-warm" href="javascript:;"><i class="am-icon-bolt"></i> 权限</a> ' +
                    '</div></td>';
            } else {
                button2 = '<td><div class="tpl-table-black-operation">' +
                    '<a  class="ed-score table-btn-yellow am-margin-right-sm" href="javascript:;"> <i class="am-icon-pencil"></i> 绩效 </a> ' +
                    '<a  class="ed-proportion table-btn-lightgreen" href="javascript:;" ><i class="am-icon-leanpub"></i> 验收比例</a> ' +
                    // '<a  class="ed-power table-btn-warm" href="javascript:;"><i class="am-icon-bolt"></i> 权限</a> ' +
                    '</div></td>';
            }

            var rowNode = table
                .row.add([
                    id,
                    user,
                    str_role,
                    str_state,
                    button1,
                    button2
                ])
                .draw()
                .node();

            $(rowNode)
                .css('class', 'gradeX')
            break;
        case 3:
            button1 = '<td><div class="tpl-table-black-operation">' +
                '<a  class="ed-nickname table-btn-blue" href="javascript:;"> <i class="am-icon-pencil"></i> 昵称 </a> ' +
                '<a  class="ed-state table-btn-green" href="javascript:;" ><i class="am-icon-leanpub"></i> 状态</a> ' +
                '<a  class="ed-password" href="javascript:;"><i class="am-icon-leanpub"></i> 密码</a> ' +
                '<a href="javascript:;"data-am-modal="{target:' + myconfirm + '}" class="tpl-table-black-operation-del let" ><i class="am-icon-trash"></i> 删除</a>' +
                '</div></td>';
            var rowNode = table
                .row.add([
                    id,
                    user,
                    str_role,
                    str_state,
                    button1
                ])
                .draw()
                .node();

            $(rowNode)
                .css('class', 'gradeX')
            break;
        default:
            break;
    }

}

function randomNumber() {
    return Math.floor(Math.random() * 123);
}
