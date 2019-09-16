//权限变量
var auth = window.parent.auth;
var baseUrl = window.parent.baseUrl;
var token = window.parent.token;
var useraccount = window.parent.account;

//上传时对应的项目
var upload_prj = -1;
//获取所有渠道列表(状态为正常的,冻结的不获取)
var channelList = null;
var ysList = null;
var projectList = null;

//初始化
var table;				//项目表对象
//绩效详情表格
var table_score_detail = null;
// 任务列表表格
var table_tasks = null;
//任务状态
const $taskStatus=[];
$taskStatus['NOT_ACQUIRED']=0;
$taskStatus['IN_ANNOTATING']=1;
$taskStatus['NO_QS']=2;
$taskStatus['IN_QS']=3;
$taskStatus['NOT_INSPECTING']=5;
$taskStatus['IN_INSPECTING']=6;
$taskStatus['CHECK_ACCEPTED']=8;
$taskStatus['QS_BACK']=4;
$taskStatus['INSPECTOR_BACK']=7;

$(document).ready(function () {

    Initialization(auth);
    //初始化表格
    table = $('#table').DataTable({
        responsive: true,
        "pageLength": 10,
        "dom": 'rt<"bottom"p><"clear">',
        "order": [
            [2, 'asc']
        ]
    });


    table_score_detail = $('#table-score-detailt').DataTable({
        responsive: true,
        "pageLength": 10,
        "dom": 'rt<"bottom"p><"clear">',
        "order": [
            [1, 'asc']
        ]
    })
    table_tasks = $('#table-tasks').DataTable({
        responsive: true,
        "pageLength": 8,
        "dom": 'rt<"bottom"p><"clear">',
        "order": [
            [1, 'asc']
        ]
    })
    //过滤器配置
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var vals = $('#projects-fliter').val().split(',');
            if (vals.indexOf('-1') != -1)
                return true;

            var state = table.row(dataIndex).data()[1];
            var result = /.*state="(.*)".*/.exec(state)[1];
            if (vals.indexOf(result) == -1)
                return false;
            return true;
        });
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var vals = $('#tasks-fliter').val().split(',');
            if (vals.indexOf('-1') != -1)
                return true;

            var state = table_tasks.row(dataIndex).data()[1];
            var result = /.*state="(.*)".*/.exec(state)[1];
            if (vals.indexOf(result) == -1)
                return false;
            return true;
        });
    //进行搜索
    $('#search-button').on('click', function () {
        table.search($('#search-input').val()).draw();
    });

    //进行搜索
    $('#search-button-score').on('click', function () {
        table_score_detail.search($('#search-input-score').val()).draw();
    });

    //进行搜索
    $('#search-button-tasks').on('click', function () {
        table_tasks.search($('#search-input-tasks').val()).draw();
    });

    //进行过滤
    $("#projects-fliter").on('change', function () {
        table.search($('#search-input').val()).draw();
    });

    //进行过滤
    $("#tasks-fliter").on('change', function () {
        table_tasks.search($('#search-input-tasks').val()).draw();
    });


    //创建项目
    $("#CreatePrj").on("click", function () {
        var newName = $("#NewPrjName").val();
        if (newName == "" || newName == null) {
            alert("项目名不能为空！");
            return;
        }
        var proType = $("input[name='radioType']:checked").val();
        console.log(proType);
        $.ajax({
            url: baseUrl + "apiproject/" + useraccount,
            type: "POST",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            data: JSON.stringify({
                "name": newName,
                "chatRoles": "[]",
                "chatEmotions": "[]",
                "type": proType,
                "proportion": 100
            }),
            success: function (res) {
                if (res.state) {
                    alert("创建成功！");
                    RefreshPrjs();
                } else {
                    alert("创建失败,名称已存在");
                }
            },
            error: function () {
                alert("网络错误");
            }
        })
    });

    //完成创建
    $("#Confirm-Create").on("click", function () {
        State_Continue(upload_prj);
    });

    //取消创建
    $("#Cancel-Create").on("click", function () {
        $.ajax({
            url: baseUrl + "apiproject/status/" + useraccount,
            type: "PUT",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            data: {
                "projectNum": upload_prj,
                "status": "FINISHED"
            },
            success: function (res) {
                if (res) {
                    $.ajax({
                        url: baseUrl + 'apiproject/' + useraccount,
                        type: "DELETE",
                        headers: {
                            "Content-type": "application/json; charset=utf-8",
                            "x_hztz_token": token
                        },
                        data: {
                            "projectNum": upload_prj
                        },
                        success: function (res) {
                            if (res) {
                                alert("删除成功");
                            } else {
                                alert("没有权限");
                            }
                        },
                        error: function () {
                            alert("连接失败");
                        }
                    })
                } else {
                    alert("还有未完成的音频，不能删除！");
                }
            },
        });
    });
    /**
     *查看概况
     */
    $('#table-body').on('click', '.check-synopsis', function () {
        var datas = table.row($(this).parents('tr')).data();
        const projectNum = $(datas[0]).attr('projectnum');

        $.ajax({
            url: baseUrl + "apiproject/"+useraccount+"/"+projectNum,
            type: "GET",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            success: function (res) {
                if(res.code===200){
                    clearTable(table_tasks);
                    const taskDatas=res.data;
                    let taskCondition=[];
                    for (let i = 0; i <6 ; i++) {
                        taskCondition[i]=0;
                    }
                    if(taskDatas!=null){
                        taskDatas.forEach((key)=>{
                           const status=$taskStatus[key.status];
                            taskCondition[0]++;
                            switch (status) {
                                case 1:
                                    taskCondition[5]++;
                                    break;
                                case 4:
                                case 7:
                                    taskCondition[4]++;
                                    break;
                                case 5:
                                    taskCondition[3]++;
                                    break;
                                case 2:
                                    taskCondition[2]++;
                                    break;
                                case 8:
                                    taskCondition[1]++;
                                    break;
                                default:
                                    break;
                            }
                        });

                        setTableSynopsis(taskCondition[0],taskCondition[1],taskCondition[2],taskCondition[3],taskCondition[4],taskCondition[5]);
                        openModel('#doc-modal-synopsis', false);
                    }
                }
            },
            error: function () {
                alert("网络错误");
            }
        });
        //启动弹窗
        // openModel('#doc-modal-synopsis', false);
        // //testdata
        // setTableSynopsis(6, 2, 3, 1, 0, 0);
    });

    /**
     *查看绩效
     */
    $('#table-body').on('click', '.check-score', function () {
        var datas = table.row($(this).parents('tr')).data();
        const projectNum = $(datas[0]).attr('projectnum');
        // console.log(projectNum);

        $.ajax({
            url: baseUrl + 'apiproject/performances/'+useraccount+'/'+projectNum,
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            type: 'GET',
            success: function (res) {
                if(res.code!=200){
                    return;
                }
                let projectData=res.data;
                let markerArray=[];
                let checkArray=[];
                let checkAllScore=[];
                let markAllScore=[];
                for (let i = 0; i <7 ; i++) {
                    checkAllScore[i]=Number(0);
                    markAllScore[i]=Number(0);
                }
                projectData.forEach((key)=>{
                    key.succEffectTime= (key.succEffectTime/(60*60)).toFixed(5);
                    key.effectTime=  (key.effectTime/(60*60)).toFixed(5);
                    // console.log(key);
                    switch (key.roleType) {
                        case 4:
                            markerArray.push(key);
                            markAllScore[0]+=Number(key.succEffectTime);
                            markAllScore[1]+=Number(key.effectTime);
                            markAllScore[2]+=key.checkBack;
                            markAllScore[3]+=key.totalRec;
                            markAllScore[4]+=key.noOperation;
                            markAllScore[5]+=key.unSubmitted;
                            markAllScore[6]+=key.noCheck;
                            break;
                        case 5:
                            checkArray.push(key);
                            checkAllScore[0]+=Number(key.succEffectTime);
                            checkAllScore[1]+=Number(key.effectTime);
                            checkAllScore[2]+=key.checkBack;
                            checkAllScore[3]+=key.totalRec;
                            checkAllScore[4]+=key.noOperation;
                            checkAllScore[5]+=key.unSubmitted;
                            checkAllScore[6]+=key.noCheck;
                            break;
                    }
                });
                // console.log(markAllScore);
                // console.log(checkAllScore);
                //设置项目绩效弹窗数据
                setTableScore("#table-markers",markAllScore[0],markAllScore[1],markAllScore[2],markAllScore[3],markAllScore[4],markAllScore[5],markAllScore[6])
                setTableScore("#table-checkers",checkAllScore[0],checkAllScore[1],checkAllScore[2],checkAllScore[3],checkAllScore[4],checkAllScore[5],checkAllScore[6])

                //启动弹窗
                openModel('#doc-modal-score', false);

                // 查看标注详情
                $('#markers-detail').unbind('click');
                $('#markers-detail').on('click', function () {
                    // closeModel('#doc-modal-score');
                    // 先移除所有数据
                    table_score_detail
                        .rows()
                        .remove()
                        .draw();
                    //添加数据
                    markerArray.forEach((key)=>{
                        addScoreData(key.name,key.succEffectTime,key.effectTime,key.checkBack,key.totalRec,key.noOperation,key.unSubmitted,key.noCheck);
                    });
                    // 模拟添加
                    // for (var i = 0; i < 20; i++) {
                    //     addScoreData('小黑人' + i, Math.floor(Math.random() * 10 + 1), (Math.random() * 10 + 1).toFixed(4), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1));
                    // }
                    openModel('#doc-modal-checkerScore', false);
                })
                // 查看质检详情
                $('#checkers-detail').unbind('click');
                $('#checkers-detail').on('click', function () {
                    // closeModel('#doc-modal-score');
                    // 先移除所有数据
                    table_score_detail
                        .rows()
                        .remove()
                        .draw();
                    //添加数据
                    checkArray.forEach((key)=>{
                        addScoreData(key.name,key.succEffectTime,key.effectTime,key.checkBack,key.totalRec,key.noOperation,key.unSubmitted,key.noCheck);
                    });
                    // // 模拟添加
                    // for (var i = 0; i < 20; i++) {
                    //     addScoreData('小黑人' + i, Math.floor(Math.random() * 10 + 1), (Math.random() * 10 + 1).toFixed(4), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1));
                    // }
                    openModel('#doc-modal-checkerScore', false);
                })
            },
            error: function () {
                alert('网络错误');
            }
        });


    });

    /**
     *查看详情
     */
    $('#table-body').on('click', '.check-detail', function () {
        var datas = table.row($(this).parents('tr')).data();
        const projectNum = $(datas[0]).attr('projectNum');
        $.ajax({
            url: baseUrl + "apiproject/"+useraccount+"/"+projectNum,
            type: "GET",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            success: function (res) {
                if(res.code===200){
                    clearTable(table_tasks);
                    const taskDatas=res.data;
                    if(taskDatas!=null){
                        taskDatas.forEach((key)=>{
                                addTaskData(key.taskId,$taskStatus[key.status],key.cutor,key.qs,key.inspector,formatStringDate(key.date));
                        })
                    }
                    openModel('#doc-modal-tasks', false);
                }
            },
            error: function () {
                alert("网络错误");
            }
        });
        

        // clearTable(table_tasks);
        // for (var i = 0; i < 18; i++)
        //     addTaskData(i, Math.floor(Math.random() * 9), '小明' + i, '小黑' + i, '小康' + i, '2019-10-01 22:12:35');

        //启动弹窗
        // openModel('#doc-modal-tasks', true);

    });


    //激活框架中提供的check与radio
    $('input[type="checkbox"], input[type="radio"]').uCheck();

    /**
     * 打开对应的面板
     */
    $('#toolbars').on('click','button',function () {
        // console.log( $(this).attr('target-id'));
        $('#target-area').children('div').hide();
        $('#' + $(this).attr('target-id')).parent().show();
    });
    /**
     * 管理项目
     */
    $('#table-body').on('click', '.pro-setting', function () {
        var datas = table.row($(this).parents('tr')).data();

        //存放项目名称与编号
        var proBase = datas[0];
        proBase = $(proBase);

        var projectNum = $(this).attr('projectNum');
        upload_prj = projectNum;
        //设置上传文件的项目id
        sessionStorage.setItem('uploadPro', upload_prj);
        sessionStorage.setItem('projectType', $(this).attr('projectType'));


        var state = $(datas[1]).attr('state');
        var idData = ["distribute-channel",
            "set-proportion",
            "set-emoji",
            "upload-doc",
            "export-pro",
            "create-over",
            "distribute-finally"
        ];

        // 隐藏所有部分
        idData.forEach(id => {
            $('#' + id).parent().hide();
            $('button[target-id="'+id+'"]').hide();
        });
        $('#rewritePro').hide();

        // console.log($(this).attr('projectType'));
        if($(this).attr('projectType')=="BIG_AUDIO"){
            $('#rewritePro').show();
            $('#rewritePro').find('input[type="checkbox"]').uCheck('uncheck');
        }

        switch (Number(state)) {
            case 0:
                $('button[target-id="'+idData[4]+'"]').show();
                $('button[target-id="'+idData[6]+'"]').show();
                break;
            case 1:
                $('button[target-id="'+idData[0]+'"]').show();
                $('button[target-id="'+idData[1]+'"]').show();
                $('button[target-id="'+idData[2]+'"]').show();
                $('button[target-id="'+idData[6]+'"]').show();

                break;
            case 2:
                $('button[target-id="'+idData[0]+'"]').show();
                $('button[target-id="'+idData[1]+'"]').show();
                $('button[target-id="'+idData[2]+'"]').show();
                $('button[target-id="'+idData[4]+'"]').show();
                $('button[target-id="'+idData[6]+'"]').show();

                break;
            case 3:
                $('button[target-id="'+idData[0]+'"]').show();
                $('button[target-id="'+idData[1]+'"]').show();
                $('button[target-id="'+idData[2]+'"]').show();
                $('button[target-id="'+idData[3]+'"]').show();
                $('button[target-id="'+idData[5]+'"]').show();
                $('button[target-id="'+idData[6]+'"]').show();

                break;
            default:
                break;
        }


        //加载项目中的必要内容
        loadProDetail(projectNum);

        //启动管理弹窗
        openModel('#doc-modal-setting', false);

        // 普通导出项目
        $('#export-pro>button').unbind('click');
        $('#export-pro>button').on('click', function () {
            var that=this;
            $.ajax({
                url: baseUrl + "apiproject/"+useraccount+"/"+projectNum,
                type: "POST",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                success: function (res) {
                    $(that).attr("disabled",true);

                    if(res.code==200){
                        const fileUrl=res.data;
                        downloadFile(baseUrl + "apiproject/"+useraccount+"/"+fileUrl);
                        $(that).attr("disabled",false);
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        });


        // 特殊导出项目
        $('#export-pro-special>button').unbind('click');
        $('#export-pro-special>button').on('click', function () {
            var that=this;
            $.ajax({
                url: baseUrl + "apiproject/"+useraccount+"/special/"+projectNum,
                type: "POST",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                success: function (res) {
                    $(that).attr("disabled",true);
                    if(res.code==200){
                        const fileUrl=res.data;
                        downloadFile(baseUrl + "apiproject/"+useraccount+"/"+fileUrl);
                        $(that).attr("disabled",false);
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        });
        // // 分配渠道
        // $('#distribute-channel>button').unbind('click');
        //
        // $('#distribute-channel>button').on('click', function () {
        //     console.log(proBase);
        //     $(this).next().toggle();
        // });

        // // 设置表情
        // $('#set-emoji>button').unbind('click');
        //
        // $('#set-emoji>button').on('click', function () {
        //     console.log(name);
        //     $(this).next().toggle();
        // });
        // 上传文件
        // $('#upload-doc>button').unbind('click');
        //
        // $('#upload-doc>button').on('click', function () {
        //     console.log(proBase);
        //     $(this).next().toggle();
        // });

        //保存标签
        $('#save-role').unbind('click');
        $('#save-role').on('click', function () {
            // console.log(upload_prj);
            var $lis = $('#role-list').children();
            var data = new Array();
            for (let i = 0; i < $lis.length; i++) {
                for (let j = 0; j <tagsData.length ; j++) {
                    if(tagsData[j].title==$lis.eq(i).children().html()){
                        data.push(tagsData[j]);
                        break;
                    }
                }
            }
            // console.log(data);
            // return;
            $.ajax({
                url: baseUrl + "apiproject/role/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "projectNum": upload_prj,
                    "chatRoles": JSON.stringify(data)
                }),
                success: function (res) {
                    if (res) {
                        alert("保存成功！");
                        RefreshPrjs();
                    } else {
                        alert("没有权限");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        })

        //保存噪音符号
        $('#save-symbol').unbind('click');
        $('#save-symbol').on('click', function () {
            // console.log(upload_prj);
            var $lis = $('#symbol-list').children();
            var data = new Array();
            for (let i = 0; i < $lis.length; i++) {
                let obj = {
                    "key": $lis.eq(i).children().eq(0).html(),
                    "value": $lis.eq(i).children().eq(1).html()
                };
                data[i] = obj;
            }
            // console.log(data);
            $.ajax({
                url: baseUrl + "apiproject/emotion/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "projectNum": upload_prj,
                    "chatEmotions": JSON.stringify(data)
                }),
                success: function (res) {
                    if (res) {
                        alert("保存成功！");
                        RefreshPrjs();
                    } else {
                        alert("没有权限");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        })



        //设置验收比例
        $('#set-proportion button').unbind('click');
        $('#set-proportion button').on('click', function () {
            var proportion = $(this).parent().prev().val();
            $.ajax({
                url: baseUrl + "apiproject/proportion/" + useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "projectNum": projectNum,
                    "proportion": proportion
                }),
                success: function (res) {
                    if (res.state) {
                        alert("设置成功！");
                        $('#now-proportion').html(proportion);
                    } else {
                        alert("没有权限");
                    }
                },
                error: function () {
                    alert("网络错误");
                }
            })
        })

        // //确认分配验收员 wait
        // $('#setYS').unbind('click');
        // $('#setYS').on('click',function () {
        //     let yss=$('#YSlist').val();
        //     console.log(yss);
        //     $.ajax({
        //         url: baseUrl + "apiproject/inspector/"+useraccount,
        //         type: "POST",
        //         headers: {
        //             "Content-type": "application/json; charset=utf-8",
        //             "x_hztz_token": token
        //         },
        //         data: JSON.stringify({
        //             "projectNum": projectNum,
        //             "inspectors":yss
        //         }),
        //         success: function (res) {
        //             console.log(res);
        //             res=res.result;
        //             if (res.false.length==0) {
        //                 alert("全部设置成功！");
        //                 window.parent.LoadPage("projects.html");
        //             }else{
        //                 alert("部分设置成功");
        //             }
        //         },
        //         error:function () {
        //             alert("网络错误");
        //         }
        //     })
        // })
        //
        // //确认分配渠道
        // $('#setQD').unbind('click');
        // $('#setQD').on('click',function () {
        //     let qds=$('#QDlist').val();
        //     console.log(qds);
        //     $.ajax({
        //         url: baseUrl + "apiproject/channel/"+useraccount,
        //         type: "POST",
        //         headers: {
        //             "Content-type": "application/json; charset=utf-8",
        //             "x_hztz_token": token
        //         },
        //         data: JSON.stringify({
        //             "projectNum": projectNum,
        //             "channels":qds
        //         }),
        //         success: function (res) {
        //             console.log(res);
        //             if (res.false.length==0) {
        //                 alert("全部设置成功！");
        //                 window.parent.LoadPage("projects.html");
        //             }else{
        //                 alert("部分设置成功");
        //             }
        //         },
        //         error:function () {
        //             alert("网络错误");
        //         }
        //     })
        // })

    });

    /**
     * 下载指定的文件
     * @param path 请求的url
     * @param jsonArray 请求携带的参数
     */
    function downloadFile(path) {
        // var form = $("<form>");
        // form.attr("style","display:none");
        // form.attr("target","");
        // form.attr("method","get");
        // form.attr("action",path);
        //
        //
        // $("body").append(form);
        // form.submit();
        // form.remove();
        // //新窗口打开
        // var newTab = window.open('about:blank')
        // newTab.location.href = path;
        // //关闭新窗口
        // newTab.close();

        var xhr = new XMLHttpRequest();

        xhr.open('GET', path, true);
        xhr.setRequestHeader("x_hztz_token", token);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = this.response;
                var filename = path.substr(path.lastIndexOf("/")+1);
                var a = document.createElement('a');
                blob.type = "application/octet-stream";
                var url = URL.createObjectURL(blob);
                a.href = url;
                a.download=filename;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        };
        xhr.send();
    }


    // 删除表情
    $('.emoji-list').on('click', 'li>i', function () {
        if (confirm("确认删除?")) {
            $(this).parent('li').remove();
        }
    })
    //新增噪音符号
    $('#add-symbol').on('click', function () {
        var $checksboxs = $("#sure-ed-symbol").next().children('label');
        var $symbolList = $('#symbol-list').children('li');
        for (let i = 0; i < $checksboxs.length; i++) {
            let $input = $checksboxs.eq(i).children('input');
            $input.uCheck('uncheck');
        }
        for (let t = 0; t < $symbolList.length; t++) {
            for (let i = 0; i < $checksboxs.length; i++) {
                let $input = $checksboxs.eq(i).children('input');
                if ($symbolList.eq(t).children('span').eq(1).html().trim() == $input.attr('value')) {
                    $input.uCheck('check');
                    // console.log('success');
                    break;
                }
            }
        }

        $(this).parent().hide().next().show().next().hide();
    })
    //确认新增符号
    $('#sure-ed-symbol').on('click', function () {
        $('#symbol-list').empty();
        var $checksboxs = $(this).next().children('label');
        for (let i = 0; i < $checksboxs.length; i++) {
            let $input = $checksboxs.eq(i).children('input');
            if (($input).is(':checked')) {
                let key = $input.attr('key');
                let value = $input.attr('value');
                addSymbol(key, value);
            }
        }
        $(this).parent().hide().prev().show().next().next().show();
    })

    //新增对话角色
    $('#add-role').on('click', function () {
        var $checksboxs = $("#sure-ed-role").next().children('label');
        var $symbolList = $('#role-list').children('li');
        for (let i = 0; i < $checksboxs.length; i++) {
            let $input = $checksboxs.eq(i).children('input');
            $input.uCheck('uncheck');
        }
        for (let t = 0; t < $symbolList.length; t++) {
            for (let i = 0; i < $checksboxs.length; i++) {
                let $input = $checksboxs.eq(i).children('input');
                // console.log($symbolList.eq(t).children('span').html().trim());

                if ($symbolList.eq(t).children('span').html().trim() == $input.attr('key')) {
                    $input.uCheck('check');
                    // console.log('success');
                    break;
                }
            }
        }

        $(this).parent().hide().next().show().next().hide();
    });


    //当前正在操作的标签数据
    var tagsData=new Array();

    /**
     *     确认新增角色
     */
    $('#sure-ed-role').on('click', function () {
        $('#role-list').empty();
        var $checksboxs = $(this).next().children('label');
        for (let i = 0; i < $checksboxs.length; i++) {
            let $input = $checksboxs.eq(i).children('input');
            if (($input).is(':checked')) {
                let key = $input.attr('key');
                addrole(key);
                //判断标签是否已经存在
                let flag=true;
                for(let j=0;j<tagsData.length;j++){
                    if(key==tagsData[j].title){
                        flag=false;
                        break;
                    }
                }
                if(flag){
                    tagsData.push({
                        title:key,
                        data:new Array()
                    })
                }
            }
        }
        // console.log(tagsData);
        $(this).parent().hide().prev().show().next().next().show();
    });

    /**
     * 显示当前标签的data值
     */
    $('#role-list').on('click','li',function (e) {
        $('#tagsData').empty();
        $('#nowWriteTag').html($(this).children().html());
        var nowTagData= new Array();
        for (var i = 0; i <tagsData.length ; i++) {
            if(tagsData[i].title==$(this).children().html()){
                nowTagData=tagsData[i].data;
                break;
            }
        }

        nowTagData.forEach(function (key) {
            addTag(key);
        });

        //增加
        $('#addTag').unbind('click');
        $('#addTag').on('click',function () {
            var val=$(this).parent().prev().val();
            if(val.trim()==""||val==null)
                return;
            addTag(val);
            nowTagData.push(val);
            tagsData[i].data=nowTagData;
            $(this).parent().prev().val("");
        });

        /**
         * 删除标签
         */
        $('#tagsData').unbind('click');
        $('#tagsData').on('click','li div button.delete',function (e) {
            var val=$(this).prev().html();
            $(this).parents('li').remove();
            nowTagData.splice($.inArray(val,nowTagData),1);
            tagsData[i].data=nowTagData;
            // console.log(tagsData);
            e.stopPropagation();
            return;

        });

    });


    /**
     * 加载项目中的表情
     * @param projectId
     */
    function loadProDetail(projectId) {
        // console.log(projectId);
        //取得操作的项目的详细数据
        let tempdata = null;
        for (let i = 0; i < projectList.length; i++) {
            if (projectList[i].num == projectId) {
                tempdata = projectList[i];
                break;
            }
        }
        $('#now-proportion').html(tempdata.proportion);

        //清空原有表情 添加新的
        $('#symbol-list').empty();
        $('#role-list').empty();
        $('#tagsData').empty();
        $('#nowWriteTag').html("当前操作的标签");
        //更新表情面板
        var temparray = JSON.parse(tempdata.chatRoles);
        for (let i = 0; i < temparray.length; i++) {
            addrole(temparray[i].title);
        }
        tagsData=temparray;
        temparray = JSON.parse(tempdata.chatEmotions);
        for (let i = 0; i < temparray.length; i++) {
            addSymbol(temparray[i].key, temparray[i].value);
        }


        //更新验收员列表
        var oldYS = new Array();
        if (tempdata.inspectors != null) {
            for (let i = 0; i < tempdata.inspectors.length; i++) {
                oldYS[i] = tempdata.inspectors[i].account;
            }
        }
        //test
        // console.log(tempdata.inspectors);

        $('#YSlist').val(oldYS);
        //重写下拉选框
        $("#YSlist").selected('destroy');
        $("#YSlist").selected({
            btnWidth: '66%',
            btnStyle: 'secondary'
        })

        var oldQD = new Array();
        if (tempdata.channels != null) {
            for (let i = 0; i < tempdata.channels.length; i++) {
                oldQD[i] = tempdata.channels[i].num;
            }
        }
        $('#QDlist').val(oldQD);
        $("#QDlist").selected('destroy');
        $("#QDlist").selected({
            btnWidth: '66%',
            btnStyle: 'secondary'
        })

        //确认分配验收员 wait
        $('#setYS').unbind('click');
        $('#setYS').on('click', function () {
            let newYS = $('#YSlist').val();
            console.log(newYS);
            console.log(oldYS);
            console.log(getLackArray(oldYS, newYS));
            // return;
            //删除旧的
            $.ajax({
                url: baseUrl + "apiproject/inspector/" + useraccount,
                type: "DELETE",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "projectNum": projectId,
                    "inspectors": getLackArray(oldYS, newYS)
                }),
                success: function (res) {
                    console.log(res);
                    //添加新的
                    $.ajax({
                        url: baseUrl + "apiproject/inspector/" + useraccount,
                        type: "POST",
                        headers: {
                            "Content-type": "application/json; charset=utf-8",
                            "x_hztz_token": token
                        },
                        data: JSON.stringify({
                            "projectNum": projectId,
                            "inspectors": newYS
                        }),
                        success: function (res) {
                            console.log(res);
                            res = res.result;
                            if (res.false.length == 0) {
                                alert("全部设置成功！");
                                window.parent.LoadPage("projects.html");
                            } else {
                                alert("部分设置成功");
                            }
                        },
                        error: function () {
                            alert("网络错误");
                        }
                    })
                },
                error: function () {
                    alert("网络错误");
                }
            })
        })

        //确认分配渠道
        $('#setQD').unbind('click');
        $('#setQD').on('click', function () {
            let newQD = $('#QDlist').val();
            // console.log(newQD);
            $.ajax({
                url: baseUrl + "apiproject/channel/" + useraccount,
                type: "POST",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "projectNum": projectId,
                    "channels": newQD
                }),
                success: function (res) {
                    alert("设置成功");
                },
                error: function () {
                    alert("网络错误");
                }
            })

        })
    }

    //加载完成后显示
    $("#projects-all").show();
});

/**
 * 向子TagData中添加数据
 * @param key
 */
function addTag(key) {
    var $li='<li class="am-margin-top-sm">' +
        '<div class="am-btn-group">' +
        '<button type="button" class="am-btn am-btn-secondary am-round am-btn-sm">'+key+'</button>' +
        '<button type="button" class="delete am-btn am-btn-secondary am-round am-btn-sm am-icon-trash"></button>' +
        '</div>' +
        '</li>';
    $('#tagsData').append($li);
}



/**
 * 取出数组1在数组2中不存在的部分
 * @param {Array} array1
 * @param {Array} array2
 */
function getLackArray(array1, array2) {
    var newArray = new Array();
    var count = 0;
    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            if (array1[i] == array2[j]) {
                break;
            } else if (j == array2.length - 1) {
                console.log('success');
                if ($.inArray(array1[i], newArray) == -1) {
                    newArray[count++] = array1[i];
                }
            }
        }
    }
    return newArray;
}

/**
 * 将表情库的噪音符号添加至对应的面板
 * @param key
 * @param value
 */
function addSymbolToPanel(key, value) {
    var tempHtml = '<label class="am-checkbox-inline am-secondary">' +
        '<input type = "checkbox" value = "' + value + '" key = "' + key + '" data-am-ucheck> ' + value + '</label >';
    $('#symbol-checks').append(tempHtml);
}

/**
 * 将表情库的对话角色添加至对应的面板
 * @param key
 */
function addRoleToPanel(key) {
    var tempHtml = '<label class="am-checkbox-inline am-secondary">' +
        '<input type = "checkbox"  key = "' + key + '" data-am-ucheck> ' + key + '</label >';
    $('#role-checks').append(tempHtml);
}

/**
 * 向项目管理面板的表情库(对话角色)区域添加内容
 * @param {String} value 对应的名称
 * @param {Boolean} close 是否能够删除
 */
function addrole(value, close) {
    var valueHtml = '<span class=" am-badge am-badge-primary am-round am-text-lg am-text-truncate">' + value + '</span >';
    var closeHtml = '<i class="am-icon-times am-icon-fw"></i>';

    var liHtml = '<li class="role mb5 p6 fw-flex fw-c-sb">' + valueHtml;

    if (close) {
        liHtml += closeHtml;
    }
    liHtml += '</li>';

    $('#role-list').append(liHtml);
}


/**
 * 向项目管理面板的表情库(噪音符号)区域添加内容
 * @param {String} key 名称
 * @param {String} value 对应的符号
 * @param {Boolean} close 是否能够删除
 */
function addSymbol(key, value, close) {
    var keyHtml = '<span class=" am-badge am-badge-primary am-text-lg am-text-truncate key" > ' + key + '</span >';
    var valueHtml = '<span class=" am-badge am-badge-primary am-text-lg am-text-truncate value" > ' + value + '</span >';
    var closeHtml = '<i class="am-icon-times am-icon-fw"></i>';

    var liHtml = '<li class="symbol mb5 p6 fw-flex fw-c-sb">' + keyHtml + valueHtml;

    if (close) {
        liHtml += closeHtml;
    }
    liHtml += '</li>';

    $('#symbol-list').append(liHtml);
}

//初始化项目管理列表的表格
/**
 * 根据登录者的权限初始化表格
 * @param {Number} power
 */
function Initialization(power) {
    //初始化项目详情过滤
    $("#tasks-fliter").empty();
    $("#tasks-fliter").append('<option value="-1">所有</option>');
    $("#tasks-fliter").append('<option value="0">未获取</option>');
    $("#tasks-fliter").append('<option value="1">标注中</option>');
    $("#tasks-fliter").append('<option value="2">待质检</option>');
    $("#tasks-fliter").append('<option value="3">质检中</option>');
    $("#tasks-fliter").append('<option value="4">质检打回</option>');
    $("#tasks-fliter").append('<option value="5">待验收</option>');
    $("#tasks-fliter").append('<option value="6">验收中</option>');
    $("#tasks-fliter").append('<option value="7">验收打回</option>');
    $("#tasks-fliter").append('<option value="8">验收合格</option>');


    $('#projects-button-group').hide();
    $("#projects-fliter").empty();
    $("#projects-fliter").append('<option value="-1">所有</option>');
    $("#projects-fliter").hide();//筛选框
    $("#table-head").empty();//行首
    switch (power) {
        case 2://渠道
            $("#table-head").append('<th>项目名称</th><th>项目概况</th><th>项目绩效</th><th>项目详情</th>');
            break;
        case 3://项目经理
            $('#projects-button-group').show();
            $("#projects-fliter").empty();
            $("#projects-fliter").append('<option value="-1">所有</option>');
            $("#projects-fliter").append('<option value="1">开放</option>');
            $("#projects-fliter").append('<option value="2">冻结</option>');
            $("#projects-fliter").append('<option value="0">结束</option>');
            $("#projects-fliter").append('<option value="3">创建中</option>');
            $("#table-head").append('<th>项目名称</th><th>状态</th><th>创建时间</th><th>状态操作</th><th>高级操作</th>');
            break;
        case 4://验收员
            $("#table-head").append('<th>项目名称</th><th>项目概况</th><th>项目绩效</th><th>项目详情</th>');
            break;

        default:
            break;
    }

    initNecessaryData();
}

/**
 * 加载必要的内容
 * @constructor
 */
function initNecessaryData() {

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

                if (auth == 3) {
                    // Add('test', 'pro', 1, "2010-10-01,23:12:23");
                    for (var i = 0; i < projectList.length; i++)
                        Add(projectList[i].num, projectList[i].name, projectStatus[projectList[i].projectStatus], projectList[i].date.substr(0, 12), projectList[i].projectType);
                } else {
                    for (var i = 0; i < projectList.length; i++)
                        addData(projectList[i].name, projectList[i].num);
                }
            } else {
                alert('没有权限');
                return;
            }

        },
        error: function () {
            alert('网络错误');
        }
    });
    // if (auth == 3)
    //     for (var i = 0; i < 6; i++)// 模拟添加数据
    // else {
    //     addData("testPro" + i);
    // }

    if (auth == 3) {
        // $('#symbol-checks').empty();
        $('#YSlist').empty();
        $('#QDlist').empty();
        //加载对话角色
        $.ajax({
            url: baseUrl + 'apiemotion/all/0',
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            type: 'GET',
            success: function (res) {
                for (var i = 0; i < res.length; i++) {
                    addRoleToPanel(res[i].value);
                }
            },
            error: function () {
                alert('网络错误');
            }
        });

        //加载噪音符号
        $.ajax({
            url: baseUrl + 'apiemotion/all/1',
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            type: 'GET',
            success: function (res) {
                for (var i = 0; i < res.length; i++) {
                    addSymbolToPanel(res[i].key, res[i].value);
                }
            },
            error: function () {
                alert('网络错误');
            }
        });

        // 加载验收员列表
        $.ajax({
            url: baseUrl + 'apiuser/accounts/all/type/' + useraccount,
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            type: 'GET',
            success: function (res) {
                //渠道列表
                // console.log(res);
                if (res.state) {
                    let data = res.userVOList;
                    for (let i = 0; i < data.length; i++) {
                        $('#YSlist').append('<option value="' + data[i].account + '">' + data[i].name + '</option>');
                    }
                } else {
                    alert("没有获取权限");
                }
            },
            error: function () {
                alert('网络错误');
            }
        });

        //加载渠道列表
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
                        $('#QDlist').append('<option value="' + data[i].num + '">' + data[i].name + '</option>');
                    }
                } else {
                    alert("没有权限");
                    window.parent.LoadPage("myself.html");
                }
            },
            error: function () {
                alert("连接失败");
            }
        })
        //模拟添加表情库的噪音符号数据 test
        // for (var i = 0; i < 15; i++) {
        //     addSymbolToPanel("key" + i, "value" + i);
        //     addRoleToPanel("key" + i);
        //     $('#YSlist').append('<option value="'+'account'+i+'">'+'验收员'+i+'</option>');
        //     $('#QDlist').append('<option value="'+'account'+i+'">'+'渠道'+i+'</option>');
        // }
    }

}

/**
 * 验收员与渠道管理员--项目管理展示
 * @param {String} name 项目名称
 * @param {String} projectNum 项目num
 */
function addData(name, projectNum) {
    var proName = '<div projectNum="' + projectNum + '">' + name + '</div>';
    var btn_synopsis = '<td><div class="tpl-table-black-operation">' +
        '<a  class="check-synopsis table-btn-blue" href="javascript:;"> <i class="am-icon-pencil"></i> 查看概况 </a> ' + '</div></td>';
    var btn_score = '<td><div class="tpl-table-black-operation">' +
        '<a  class="check-score table-btn-green" href="javascript:;"> <i class="am-icon-pencil"></i> 绩效查看 </a> ' + '</div></td>';
    var btn_detail = '<td><div class="tpl-table-black-operation">' +
        '<a  class="check-detail table-btn-lightgreen" href="javascript:;"> <i class="am-icon-pencil"></i> 项目详情 </a> ' + '</div></td>';
    var rowNode = table
        .row.add([
            proName,
            btn_synopsis,
            btn_score,
            btn_detail
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');
}

/**
 * 向任务列表中添加任务数据
 * @param {Number} taskid  任务id
 * @param {Number} state 状态
 * @param {String} marker 标注员
 * @param {String} checker 质检员
 * @param {String} verify 验收员
 * @param {String} date 最后操作时间
 */
function addTaskData(taskid, state, marker, checker, verify, date) {
    state = GetTaskState(state);
    var rowNode = table_tasks
        .row.add([
            taskid,
            state,
            marker,
            checker,
            verify,
            date
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');
}

/**
 * 添加绩效详情的每一条数据
 * @param {String} nick 昵称
 * @param {Number} finish //已完成数目
 * @param {Number} valTime    //有效时长
 * @param {Number} noPass    //打回次数
 * @param {Number} editWait    //待修改
 * @param {Number} pushWait    //待提交
 * @param {Number} reviewWait    //待审核
 */
function addScoreData(nick,finishValTime,valTime, noPass,finish, editWait, pushWait, reviewWait) {
    var rowNode = table_score_detail
        .row.add([
            nick,
            finishValTime,
            valTime,
            noPass,
            finish,
            editWait,
            pushWait,
            reviewWait
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');
}

/**
 * 获取项目状态文本
 * @param {Number} state
 */
function GetStateStr(state) {
    var str_state = '未知状态';
    switch (state) {
        case 1:
            str_state = '开放';
            break;
        case 2:
            str_state = '冻结';
            break;
        case 3:
            str_state = '创建中';
            break;
        case 0:
            str_state = '结束';
            break;
    }
    return '<div class="" state="' + state + '">' + str_state + '</div>';
}

//插入数据
function Add(id, name, state, time, projectType) {
    var proName = '<div projectNum="' + id + '">' + name + '</div>';

    var str_state = GetStateStr(state);
    var btnState = '';
    var btnFun = '';

    // 各类按钮
    var proSynopsis = '<a  class="check-synopsis table-btn-blue" href="javascript:;"> <i class="am-icon-pencil"></i> 查看概况 </a> ';

    var proScore =
        '<a  class="check-score table-btn-green" href="javascript:;"> <i class="am-icon-pencil"></i> 绩效查看 </a> ';

    var proDetail =
        '<a  class="check-detail table-btn-lightgreen" href="javascript:;"> <i class="am-icon-pencil"></i> 项目详情 </a> ';

    var proSetting =
        '<a  projectType="' + projectType + '"  projectNum="' + id + '" class="pro-setting table-btn-lightgreen" href="javascript:;"> <i class="am-icon-pencil"></i> 管理 </a> ';
    var proPause = '<a href="javascript:State_Pause(\'' + id + '\');" class="tpl-table-black-operation-del"><i class="am-icon-pause"></i> 冻结</a>';

    var proStart = '<a href="javascript:State_Continue(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-play"></i> 继续</a>';

    var proOver = '<a href="javascript:State_Stop(\'' + id + '\');" class="tpl-table-black-operation-del"><i class="am-icon-gavel"></i> 结束</a>';

    var proNull = '<a href="#" class="tpl-table-black-operation"><i class="am-icon-download am-icon-fw"></i> 无可用操作</a>';

    var button = '<td><div class="tpl-table-black-operation">' +
        '<a href="javascript:DownloadProject(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-download am-icon-fw"></i></i> 导出数据</a></div></td></tr>';

    switch (state) {
        case 1:
            btnState = '<div class="tpl-table-black-operation">' + proPause + proOver + '</div>';
            btnFun = '<div class="tpl-table-black-operation">' + proSynopsis + proScore + proDetail + proSetting + '</div>';
            break;
        case 2:
            btnState = '<div class="tpl-table-black-operation">' + proStart + proOver + '</div>';
            btnFun = '<div class="tpl-table-black-operation">' + proSynopsis + proScore + proDetail + proSetting + '</div>';
            break;
        case 3:
            btnState = '<div class="tpl-table-black-operation">' + proNull + '</div>';
            btnFun = '<div class="tpl-table-black-operation">' + proSetting + '</div>';
            break;
        case 0:
            btnState = '<div class="tpl-table-black-operation">' + proNull + '</div>';
            btnFun = '<div class="tpl-table-black-operation">' + proSynopsis + proScore + proDetail + proSetting + '</div>';
            break;
        default:
            break;
    }
    // if (state == 1)
    // 	button = '<div class="tpl-table-black-operation">' +
    // 		'<a href="javascript:State_Pause(\'' + id + '\');" class="tpl-table-black-operation-del"><i class="am-icon-pause"></i> 冻结</a>' +
    // 		'<a href="javascript:State_Stop(\'' + id + '\');" class="tpl-table-black-operation-del"><i class="am-icon-gavel"></i> 结束</a></div>';
    // else if (state == 2)
    // 	button = '<div class="tpl-table-black-operation">' +
    // 		'<a href="javascript:State_Continue(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-play"></i> 继续</a>' +
    // 		'<a href="javascript:State_Stop(\'' + id + '\');" class="tpl-table-black-operation-del"><i class="am-icon-gavel"></i> 结束</a></div>';
    // else if (state == 0)
    // 	button = '<td><div class="tpl-table-black-operation">' +
    // 		'<a href="javascript:ContinueProject(\'' + id + '\',\'' + name + '\');" class="tpl-table-black-operation-green"><i class="am-icon-cloud-upload am-icon-fw"></i></i> 继续上传</a></div></td></tr>';

    // else if (state == 3)
    // 	button = '<td><div class="tpl-table-black-operation">' +
    // 		'<a href="javascript:alert(\'系统正在创建分割后的文件，请稍后刷新再试\');" class="tpl-table-black-operation"><i class="am-icon-download am-icon-fw"></i></i> 还不能导出</a></div></td></tr>';


    // var button_channel = '<td><div class="tpl-table-black-operation edit-channels">' +
    // 	'<a href="#" class="tpl-table-black-operation-green"><i class="am-icon-pencil am-icon-fw"></i></i> 分配修改</a></div></td></tr>';
    // if (state == 0)
    // 	button_channel = '<td><div class="tpl-table-black-operation">' +
    // 		'<a href="#" class="tpl-table-black-operation"><i class="am-icon-clock-o am-icon-fw"></i></i> 创建中</a></div></td></tr>';


    // var button_look = '<td><div class="tpl-table-black-operation">' +
    // 	'<a href="javascript:LookProject(\'' + id + '\');" class="tpl-table-black-operation-green"><i class="am-icon-eye am-icon-fw"></i></i> 查看详情</a></div></td></tr>';

    var rowNode = table
        .row.add([
            proName,
            str_state,
            time,
            btnState,
            btnFun
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');

    // $(rowNode).on("click", ".edit-channels", function () {
    // 	ChangeChannel($(rowNode), name, channels);
    // });
}


function State_Continue(id) {
    ChangeState(id, 'ONGOING');
}

function State_Pause(id) {
    ChangeState(id, 'PAUSE');
}

/**
 * 结束项目
 * @param id
 * @constructor
 */
function State_Stop(id) {
    if(confirm("确认结束此项目吗,结束后不可再开启?")){
        ChangeState(id, 'FINISHED');
    }
}

function LookProject(id) {
    window.parent.LoadPage("audios.html", ["loadPrj", id]);
}

/**
 * 更改项目状态
 * @param id
 * @param state
 * @constructor
 */
function ChangeState(id, state) {
    // console.log(id);
    var action=-1;
    switch (state) {
        case 'ONGOING':
            action=2;
            break;
        case 'PAUSE':
            action=0;
            break;
        case 'FINISHED':
            action=1;
            break;
        default:
            action=-1;
            break;
    }
    console.log(action);
    $.ajax({
        url: baseUrl + "apiproject/status/" + useraccount,
        type: "PUT",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        data: JSON.stringify({
            "projectNum": id,
            "action": action
        }),
        success: function (res) {
            if (res) {
                RefreshPrjs();
            } else {
                alert("还有未完成的音频，不能删除！");
            }
        },
    });
}


/**
 * 刷新项目列表
 * @constructor
 */
function RefreshPrjs() {
    // table
    //     .rows()
    //     .remove()
    //     .draw();
    window.parent.LoadPage("projects.html");
}


function StartNewMark() {
    upload_prj = 0;
    $("#NewPrjName").val('');
    $("#CreatePrj").addClass("am-active");
    $("#CreatePrj").removeClass("am-disabled");
    $("#CreatePrj").text("创建项目");
    $("#uploader").hide();
    $("#upload-modal").modal("open");


}

function DownloadProject(id) {
    $.ajax({
        url: baseUrl + "api/audiothree/projectExport",
        type: "post",
        data: {"id": id},
        success: function (data) {
            data = JSON.parse(data);
            if (data['state'] == 0) {
                data = data['file'];
                var form = $('<form method="GET"></form>');
                form.attr('action', baseUrl + data);
                form.appendTo($('body'));
                form.submit();
            } else if (data['state'] == 1)
                alert("该项目的导出文件还在生成中！");
            else if (data['state'] == 2)
                alert("该项目没有可导出的内容");

        },
    });
}
/*
 *格式化字符串日期
 */
function formatStringDate(date) {
    return date.substr(0,4)+"-"+date.substr(4,2)+"-"+date.substr(6,2)+" "+date.substr(8,2)+":"+date.substr(10,2)+":"+date.substr(12,2);
}

//继续上传
function ContinueProject(id, name) {
    upload_prj = id;
    $("#NewPrjName").val(name);
    $("#CreatePrj").removeClass("am-active");
    $("#CreatePrj").addClass("am-disabled");
    $("#CreatePrj").text("创建成功");
    $("#uploader").show();
    $("#upload-modal").modal("open");
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
 * 刷新项目概况弹窗数据
 * @param {String} all            总数目
 * @param {String} finish        已完成
 * @param {String} qualityWait    带质检
 * @param {String} acceptanceWait 待验收
 * @param {String} editWait    待修改
 * @param {String} finishWait    待完成
 */
function setTableSynopsis(all, finish, qualityWait, acceptanceWait, editWait, finishWait) {
    var $tableScore = $('#table-synopsis');
    var $tbody = $tableScore.children('tbody');
    var $tdArr = $tbody.find('tr td');
    $tdArr.eq(0).html(all);
    $tdArr.eq(1).html(finish);
    $tdArr.eq(2).html(qualityWait);
    $tdArr.eq(3).html(acceptanceWait);
    $tdArr.eq(4).html(editWait);
    $tdArr.eq(5).html(finishWait);
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

//获取状态文本
function GetTaskState(state) {
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
 * 清空表格内容
 * @param {DataTable} $table DataTable对象
 */
function clearTable($table) {
    $table.rows()
        .remove()
        .draw();
}