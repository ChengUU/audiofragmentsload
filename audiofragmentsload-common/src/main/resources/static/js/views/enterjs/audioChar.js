var baseUrl = window.parent.baseUrl;
var token = window.parent.token;
var useraccount = window.parent.account;

$(function () {
    //加载对话角色
    //清空测试内容
    $('#audioRole-list').empty();
    $('#audioChar-list').empty();
    $.ajax({
        url:baseUrl+'apiemotion/all/0',
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        type:'GET',
        success:function (res) {
            for (var i = 0; i <res.length ; i++) {
                var $li = '<li key="'+res[i].id+'"><span class="am-text-default am-badge am-badge-warning am-radius">' + res[i].value + '</span>' +
                    '<i class="am-icon-trash am-icon-fw del-char" ></i ></li >';
                $('#audioRole-list').append($li);
            }
        },
        error:function () {
            alert('网络错误');
        }
    });

    //加载噪音符号
    $.ajax({
        url:baseUrl+'apiemotion/all/1',
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        type:'GET',
        success:function (res) {
            for (var i = 0; i <res.length ; i++) {
                var $li = '<li key="'+res[i].id+'"><em class="am-badge am-badge-primary am-radius am-text-default">' + res[i].value + '</em>&nbsp;&nbsp;<span class="am-text-default am-badge am-badge-warning am-radius">' + res[i].key + '</span>' +
                    '<i class="am-icon-trash am-icon-fw del-char" ></i ></li >';
                $('#audioChar-list').append($li);
            }
        },
        error:function () {
            alert('网络错误');
        }
    });

})

/**
 * 打开新增角色符号弹窗
 */
$('#add-role').on('click', function () {
    openModel('#layer-role', false);
})
/**
 * 关闭弹出窗
 */
$('#close-role').on('click', function (e) {
    closeModel('#layer-role');
})

/**
 * 确认新增的角色符号内容
 */
$('#sureAdd-role').on('click', function (e) {
    var $code = $(this).prev().children();
    var code = $code.children().val();
    var array = new Array();
    $('#audioRole-list').children('li').children('span').each(function (key, val) {
        array.push($(this).html());
    })
    if (isRepeatinArr(code, array)) {
        alert("符号已存在");
        return;
    }
    if (code != "" && code != null && name != "" && name != null) {
        addEmoji(code,code,'ROLE');
        $code.children().val("");
    } else {
        return;
    }
})

/**
 * 保存角色符号
 */
$('#save-role').on('click', function (e) {
    var arrC = new Array();//噪音符号

    $('#audioRole-list').children('li').children('span').each(function (key, val) {
        arrC.push($(this).html());
    })

    var resultdata = '{"data":[';
    for (var j = 0; j < arrC.length; j++) {
        resultdata += ('{"Code":"' + arrC[j] + '"},');
    }
    resultdata = resultdata.substr(0, resultdata.length - 1);
    resultdata += ']}';
    // console.log(resultdata);
    // console.log(JSON.parse(resultdata));

    if (!strisJSON(resultdata))
        resultdata = '{"data":[]}';

    console.log(JSON.parse(resultdata));
    $.ajax({
        url: baseUrl + 'api/audio/setAudiochar',
        type: 'post',
        data: {
            data: resultdata
        },
        success: function (data) {
            data = Number(data);
            if (data == 1)
                alert('保存成功');
            else
                alert('参数错误,请联系管理员');
        },
        error: function () {
            alert('上传参数错误!!!');
        }
    })
})

/**
 *  删除角色符号
 */
$('#audioRole-list').on('click', '.del-char', function () {
    if (confirm("确认删除此角色符号?")) {
        var that=this;
        $.ajax({
            url: baseUrl + "apiemotion/" + useraccount,
            type: "DELETE",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            data: JSON.stringify({
                "id":$(that).parent('li').attr('key')
            }),
            success: function (res) {
                if (res.state) {
                    $(that).parent('li').remove();
                } else {
                    alert("删除失败");
                }
            },
            error: function () {
                alert("网络错误");
            }
        })
    }
})


/**
 * 打开新增噪音符号弹窗
 */
$('#add-char').on('click', function () {
    openModel('#layer-char',false);
})
/**
 * 关闭弹出窗
 */
$('#close-char').on('click', function (e) {
    closeModel('#layer-char');
})

/**
 * 确认新增的噪音内容
 */
$('#sureAdd-char').on('click', function (e) {
    var $name = $(this).prev().children();
    var $code = $name.next();
    var name = $name.children().val();
    var code = $code.children().val();
    var array = new Array();
    $('#audioChar-list').children('li').children('em').each(function (key, val) {
        array.push($(this).html());
    })
    if (isRepeatinArr(name, array)){
        alert("名称已存在");
        return;
    }
    array.splice(0, array.length);
    $('#audioChar-list').children('li').children('span').each(function (key, val) {
        array.push($(this).html());
    })
    if (isRepeatinArr(code, array)){
        alert("符号已存在");
        return;
    }
    if (code != "" && code != null && name != "" && name != null) {
        addEmoji(code,name,'EMOTION');
        $name.children().val("");
        $code.children().val("");
    } else {
        return;
    }
})

/**
 * 保存噪音符号
 */
$('#save-char').on('click',function (e) {
    var arrN=new Array();//噪音符号名称
    var arrC=new Array();//噪音符号
    $('#audioChar-list').children('li').children('em').each(function (key, val) {
        arrN.push($(this).html());
    })
    $('#audioChar-list').children('li').children('span').each(function (key, val) {
        arrC.push($(this).html());
    })
    var resultdata='{ "data":[';
    for(var j=0;j<arrN.length;j++){
        resultdata+=('{"Name":"'+arrN[j]+'","Code":"'+arrC[j]+'"},');
    }
    resultdata=resultdata.substr(0,resultdata.length-1);
    resultdata+=']}';
    // console.log(resultdata);
    // console.log(JSON.parse(resultdata));
    
    if(!strisJSON(resultdata))
    	resultdata='{ "data":[]}';
    
        console.log(JSON.parse(resultdata));
    
    $.ajax({
    	 url:baseUrl+'api/audio/setAudiochar',
        type:'post',
        data:{
            data:resultdata
        },
        success:function (data) {
            data=Number(data);
            if(data==1)
            alert('保存成功');
            else
            alert('参数错误,请联系管理员');
        },
        error:function () {
            alert('上传参数错误!!!');
        }
    })
})

/**
 *  删除噪音符号
 */
$('#audioChar-list').on('click','.del-char',function(){
    if (confirm("确认删除此噪音符号?")) {
        var that=this;
        $.ajax({
            url: baseUrl + "apiemotion/" + useraccount,
            type: "DELETE",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            data: JSON.stringify({
                "id":$(that).parent('li').attr('key')
            }),
            success: function (res) {
                if (res.state) {
                    $(that).parent('li').remove();
                } else {
                    alert("删除失败");
                }
            },
            error: function () {
                alert("网络错误");
            }
        })
    }
})

/**
 * 异步新增表情
 * @param key
 * @param value
 * @param type
 */
function addEmoji(key,value,type) {
    $.ajax({
        url: baseUrl + "apiemotion/" + useraccount,
        type: "POST",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "x_hztz_token": token
        },
        data: JSON.stringify({
            "key": key,
            "value": value,
            "type": type
        }),
        success: function (res) {
            if (res.state) {
                var data = res.emotionVO;
                switch (type) {
                    case 'ROLE':
                        var $li = '<li key="' + data.id + '"><span class="am-text-default am-badge am-badge-warning am-radius">' + data.value + '</span>' +
                            '<i class="am-icon-trash am-icon-fw del-char" ></i ></li >';
                        $('#audioRole-list').append($li);
                        break;
                    case 'EMOTION':
                        var $li = '<li key="' + data.id + '"><em class="am-badge am-badge-primary am-radius am-text-default">' + data.value + '</em>&nbsp;&nbsp;<span class="am-text-default am-badge am-badge-warning am-radius">' + data.key + '</span>' +
                            '<i class="am-icon-trash am-icon-fw del-char" ></i ></li >';
                        $('#audioChar-list').append($li);
                        break;
                    default:
                        alert('类型错误');
                        break;
                }
            } else {
                alert("添加失败");
            }
        },
        error: function () {
            alert("网络错误");
        }
    })
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
 * 判断值是否在数组中已存在
 * @param {待判断值} element 
 * @param {数组} arr 
 */
function isRepeatinArr(element, arr) {
    if ($.inArray(element, arr) >= 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * 判断字符串是否符合json格式
 * @param {待判断的字符串} str 
 */
function strisJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                console.log("success");
                return true
            } else {
                return false;
            }
        } catch (e) {
            console.log('error：' + str + '!!!' + e);
            return false;
        }
    }
}

