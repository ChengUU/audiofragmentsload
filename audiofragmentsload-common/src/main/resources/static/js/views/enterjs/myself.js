
//获取权限
var baseUrl = window.parent.baseUrl;
var userrole = window.parent.auth;
var account=window.parent.account;
var name=window.parent.auth_info.name;
var token=window.parent.token;

var scoreTable1 = $("#table1-body");
var projectsData=null;//项目列表数据

Init(userrole);
basicInformation(account,name , userrole);

$(document).ready(function () {

	// Add(scoreTable1,22,40,2,18,2,0);
	// scoreTable.remove();
	// Add($("#table2-body"),22,40,2,18,2,0,3);
	/**
	 * 修改昵称
	 */
	$("#username").val('');
	var $prompt = $("#my-user");
	var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
	$confirmBtn.off('click.confirm.modal.amui').on('click', function (e) {
		setUserName(e);
	});

	/**
	 * 修改密码
	 */
	$("#apassword").val('');
	$('#bpassword').val('');
	var $name = $("#my-password");
	var $confirmBtn1 = $name.find('[data-am-modal-confirm]');
	$confirmBtn1.off('click.confirm.modal.aumi').on('click', function (e) {
		setpassword(e);
	});

	//选择查看绩效的项目
	$('#projectList').on('change',function () {
		// console.log("success");
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
					scoreTable1.children().remove();
					//向表中刷新数据
					score.succEffectTime=(score.succEffectTime/(60*60)).toFixed(5);
					score.effectTime=(score.effectTime/(60*60)).toFixed(5);
					Add(scoreTable1,score.succEffectTime,score.effectTime,score.checkBack,score.totalRec,score.noOperation,score.unSubmitted,score.noCheck);
				}
			},
			error: function () {
				alert("连接失败！");
			}
		});

	})
});


//修改昵称
function setUserName(e) {
	var getuser = $("#username").val();
	if (getuser == '') {
		alert('请输入昵称！');
		e.stopPropagation();
	}
	else {
		//对昵称的格式进行判断
		if (getuser.length >= 5 && getuser.length <= 10) {
			$.ajax({
				type: "PUT",
				url: baseUrl + "apiuser/update/"+account,
				headers: {
					"Content-type": "application/json; charset=utf-8",
					"x_hztz_token":token
				},
				data: JSON.stringify({
					"name": getuser
				}),
				success: function (res) {
					console.log(res);
					if (res.state == 1) {
						alert("昵称已存在！");
						e.stopPropagation();
					}
					else if (res.state == 0) {
						alert("修改成功！");
						window.parent.setName(getuser);
						window.parent.LoadPage("myself.html");
					}
					else {
						alert("返回参数错误！");
					}
				},
				error: function () {
					alert("连接失败！");
					$("#username").val('');
				}
			});

		} else {
			alert("昵称格式/长度错误！");
			e.stopPropagation();
		}
	}
}
//修改密码
function setpassword(e) {
	var apass = $("#apassword").val();
	var bpass = $("#bpassword").val();
	var rote = /^[A-Za-z0-9]+$/;
	if (apass == '' || bpass == '') {
		alert("请输入！");
		e.stopPropagation();
	} else {
		if (rote.test(apass) == true && rote.test(bpass) == true && apass.length >= 6 && apass.length <= 10 && bpass.length >= 6 && bpass.length <= 10) {

			$.ajax({
				type: "PUT",
				url: baseUrl + "apiuser/update/"+account,
				headers: {
					"Content-type": "application/json; charset=utf-8",
					"x_hztz_token":token
				},
				data: JSON.stringify({
					"oldPassword": apass,
					"password":bpass
				}),
				success: function (res) {
					console.log(res);
					if (res.state == 1) {
						alert("密码错误");
						e.stopPropagation();
					}
					else if (res.state == 0) {
						alert("修改成功！");
						localStorage.removeItem("token");
						localStorage.removeItem("nowUser");
						window.location.href = "login.html";
					}
					else {
						alert("返回参数错误！");
					}
				},
				error: function () {
					alert("连接失败！");
					$("#username").val('');
				}
			});
		} else {
			alert("输入格式错误！");
			e.stopPropagation();
		}
	}
}
//页面的初始化
function Init(userrole) {
	var ss = 0;
	var $scorePanel=$('#scorePanel');
	var $jixiao1 = $("#jixiao1");
	var $jixiao2 = $("#jixiao2");
	switch (userrole) {
		case 1:
			$scorePanel.hide();
			break;
		case 2:
			$scorePanel.hide();
			break;
		case 3:
			$scorePanel.hide();

			break;
		case 4:
			initProList();
			$scorePanel.show();
			$jixiao1.show();
			break;
		case 5:
			initProList();
			$scorePanel.show();
			$jixiao1.show();
			break;
		case 6:
			initProList();
			$scorePanel.show();
			$jixiao1.show();
			break;
	}

}

/**
 * 初始化项目列表
 */
function initProList() {
	if(userrole!=1&&userrole!=2&&userrole!=3){
		//获取项目列表
		// $('#projectList').empty();
		$.ajax({
			url: baseUrl + 'apiproject/all/' + account,
			headers: {
				"Content-type": "application/json; charset=utf-8",
				"x_hztz_token": token
			},
			type: 'GET',
			success: function (res) {
				projectsData=res.projects;
				projectsData.forEach(function (key) {
					$('#projectList').append('<option value="' + key.num + '">' + key.name + '</option>');
				})
				$("#projectList").selected('destroy');
				$("#projectList").selected({
					btnWidth: '30%',
					btnSize: 'md',
					btnStyle: 'secondary'
				})

			},
			error: function () {
				alert('网络错误');
			}
		});
	}
}

/**
 * 设置基本信息
 * @param user
 * @param nickname
 * @param power
 */
function basicInformation(user, nickname, power) {
	//通过text()来设置其内容，或者获取其内容
	var role = '';
	switch (power) {
		case 1:
			role = '平台管理员';
			break;
		case 2:
			role = '渠道管理员';
			break;
		case 3:
			role = '项目经理';
			break;
		case 4:
			role = '验收员';
			break;
		case 5:
			role = '质检员';
			break;
		case 6:
			role = '标注员';
			break;
		default:
			break;
	}
	$("#user").text(user);
	$("#nickname").text(nickname);
	$("#power").text(role);
}


/**
 * 刷新个人绩效数据
 * @param $table 表格
 * @param finishValTime 验收合格有效时长
 * @param valTime 有效时长
 * @param interupt 打回次数
 * @param finish 完成数目
 * @param wait_edit 待修改
 * @param wait_submit 待提交
 * @param wait_check 待审核
 * @constructor
 */
function Add($table,finishValTime, valTime, interupt,finish, wait_edit, wait_submit,wait_check) {
	$table.append('<tr><td>' + finishValTime + '</td><td>'+valTime + '</td><td>' + interupt + '</td><td>' + finish + '</td><td>' + wait_edit + '</td><td>' + wait_submit + '</td><td>' + wait_check + '</td></tr>');
}

function randomNumber() {
		return Math.floor(Math.random()*123);
}