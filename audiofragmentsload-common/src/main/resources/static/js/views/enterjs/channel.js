
var baseUrl = window.parent.baseUrl;
//设置值权限
var roleauto=window.parent.auth;
var token = window.parent.token;
var useraccount = window.parent.account;

//接受后端传过来的数据
var userdata = null;
//设置表格
var table = null;

//存放行首的账号
var account = null;
$(document).ready(function () {
	//初始化表格
    Init_auth();
    channelAdd();
	table = $('#audio-table').DataTable({
		responsive: true,//是否是响应式？
		"pageLength": 10,//每页条数
		"dom": 'rt<"bottom"p><"clear">',//添加分页控件12004
		"order": [[2, 'asc']]//初始化排序是以那一列进行排序，并且，是通过什么方式来排序的，下标从0开始，‘’asc表示的是升序，desc是降序
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

	// //模拟添加数据
	// switch (roleauto) {
	// 	case 3:
	// 		AddListForChannel("131312","nicheng1","天下秀");
    //         AddListForChannel("131312", "nicheng1", "天下秀");
	// 		break;
	// 	default:
	// 		break;
	// }


	//进行搜索
	$('#search-button').on('click', function () {
		table.search($('#search-input').val()).draw();
	});


	//进行过滤
	$("#audio-fliter").on('change', function () {
		table.search($('#search-input').val()).draw();//表格的重新加载
	});

	/*单个删除*/
	$("#table-body").on('click', '.let', function () {
		var that=this;
		var tables = $('#audio-table').DataTable();
		var data1 = tables.row($(this).parents('tr')).data();
		var channelNum=$(this).parent().attr('channel');
		var getuser = data1[0];
		var $prompt = $('#my-confirm');
		var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
		var achieveOne = 1//解决多次弹出删除失败
		$confirmBtn.off('click.confirm.modal.amui').on('click', function () {
			if (achieveOne == 1)
				achieveOne = 0;
			else
				return;
			console.log(getuser+'\n'+channelNum);
			$.ajax({
				url: baseUrl + "apichannel/" + useraccount,
				type: "DELETE",
				headers: {
					"Content-type": "application/json; charset=utf-8",
					"x_hztz_token": token
				},
				data: JSON.stringify({
					"num":channelNum,
					"manager":getuser
				}),
				success: function (res) {
					if (res) {
						alert("删除成功");
						tables.row($(that).parents('tr')).remoove();
						tables
						    .rows()
						    .draw();
						//关闭弹出层
						closeModel('#doc-modal-1');
					} else {
						alert("更改失败,该管理员已被使用");
					}
				},
				error: function () {
					alert("网络错误");
				}
			})
		});

	});

});

/**
 *更改渠道管理员
 */
$('#table-body').on('click', '.ed-admin', function () {
	var tempTable = $('#audio-table').DataTable();
	var datas = tempTable.row($(this).parents('tr')).data();
	account = datas[0];
	var channelNum=$(this).parent().attr('channel');
	changeModalMessage("昵称", "请在此处输入新的昵称");
	$("#projectList2").parent().hide();
	//启动弹窗
	openModel('#doc-modal-1', false);

	$('#sure-set').unbind('click');
	$('#sure-set').on('click', function (e) {
		var text = $('#admin').val();
		if (text == "" || text == null) {
			return;
		} else {
			console.log(text + '\n' + channelNum);
			$.ajax({
				url: baseUrl + "apichannel/" + useraccount,
				type: "PUT",
				headers: {
					"Content-type": "application/json; charset=utf-8",
					"x_hztz_token": token
				},
				data: JSON.stringify({
					"num":channelNum,
					"manager":text
				}),
				success: function (res) {
					if (res) {
						alert("更改成功");
						//关闭弹出层
						closeModel('#doc-modal-1');
					} else {
						alert("更改失败,该管理员已被使用");
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

/**
 * 添加渠道
 */
function channelAdd() {
	var $prompt = $('#my-prompt');
	var $confirmBtn = $prompt.find('[data-am-modal-confirm]');

	$confirmBtn.off('click.confirm.modal.amui').on('click', function (e) {
        // do something
		$.ajax({
			url: baseUrl + 'apichannel/' + useraccount,
			type: "POST",
			headers: {
				"Content-type": "application/json; charset=utf-8",
				"x_hztz_token": token
			},
			data:JSON.stringify({
				'name':	$('#channel-name').val(),
				'channelManager':$('#adminlist').val()
			}),
			success: function (res) {
				if (res.state) {
					alert("添加成功");
					closeModel("#my-prompt");//代码关闭
					window.parent.LoadPage("channel.html");
				} else {
					alert("渠道名称重复或管理员已被使用");
				}
			},
			error: function () {
				alert("连接失败");
			}
		});

        clearVal("#channel-name");
        e.stopPropagation();//阻止自动关闭
	});

}
/**
 * 清空input控件的值
 * @param {String} inputid 
 */
function clearVal(inputid) {
    $(inputid).val("");
}
function sclear($a, $b) {
	$a.val('');
	$b.val('');
}
//渠道管理员列表
var channelAdmin=null;
/**
 * 初始化
 */
function Init_auth() {
	$("#audio-fliter").empty();//筛选框
	$("#table-head").empty();//行首
	$(".role").empty();//添加的角色选项
	switch (roleauto) {
		case 3:
			$("#audio-fliter").append('<option value="-1">所有</option>');
			// $("#audio-fliter").append('<option value="2">渠道管理员</option>');
			$("#table-head").append('<th>管理员账号</th><th>昵称</th><th>渠道名称</th><th>常规操作</th>');
			// $(".role").append('<option value="-1">选择渠道管理员</option>');
			break;
	}
	//获取渠道管理员列表
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
				channelAdmin=data;
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
					if(power[data[i].characterType]==2)
					$(".role").append('<option value="'+data[i].account+'">'+data[i].name+'</option>');
				}

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
							console.log(data);
							for (var i = 0; i < data.length; i++) {
								let name=null;
								for (let j = 0; j <channelAdmin.length ; j++) {
									if(channelAdmin[j].account==data[i].manager){
										name=channelAdmin[j].name;
										break;
									}
								}
								AddListForChannel(data[i].manager,name,data[i].name,data[i].num);
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
			} else {
				alert("没有权限");
				window.parent.LoadPage("myself.html");
			}
		},
		error: function () {
			alert("连接失败");
		}
	});


}
/**
 * 向表格中添加渠道数据
 * @param {*} admin 管理员账号
 * @param {*} nickname 昵称
 * @param {*} channelname 渠道名称
 * @param {*} channelnum 渠道编号
 */
function AddListForChannel(admin, nickname, channelname,channelnum) {
	
	var myconfirm = "'#my-confirm'";//删除按钮弹窗
    var btns = '<td ><div class="tpl-table-black-operation"  channel="'+channelnum+'">' +
        '<a  class="ed-admin table-btn-yellow am-margin-right-sm" href="javascript:;"> <i class="am-icon-pencil "></i> 修改 </a>' +
        '<a href="javascript:;"data-am-modal="{target:' + myconfirm + '}" class="tpl-table-black-operation-del let" ><i class="am-icon-trash"></i> 删除</a>' +
        '</div></td>'
    var rowNode = table
        .row.add([
            admin,
            nickname,
            channelname,
            btns
        ])
        .draw()
        .node();

    $(rowNode)
        .css('class', 'gradeX');

}

function randomNumber() {
	return Math.floor(Math.random() * 123);
}
