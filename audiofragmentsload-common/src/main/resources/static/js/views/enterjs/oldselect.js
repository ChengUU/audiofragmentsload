 //0	|	[int]	|	待定
//1	|	[int]	|	平台管理员
//2	|	[int]	|	验收员
//3	|	[int]	|	渠道管理者
//4	|	[int]	|	标注员
//5	|	[int]	|	质检员
//var roleauto=3;
var baseUrl = window.parent.baseUrl;
//设置值权限
var roleauto=window.parent.auth;
//接受后端传过来的数据
var userdata;
//设置表格
var table;
$(document).ready(function() {	
	//初始化表格
	Init_auth();
	table = $('#audio-table').DataTable({
		responsive: true,//是否是响应式？
		"pageLength": 10,//页数
		"dom": 'rt<"bottom"p><"clear">',//添加分页控件12004
		"order": [[ 2, 'asc' ]]//初始化排序是以那一列进行排序，并且，是通过什么方式来排序的，下标从0开始，‘’asc表示的是升序，desc是降序
	});

	//过滤器配置（对于搜索框的配置，自定义筛选）
	$.fn.dataTable.ext.search.push(
		function(settings, data, dataIndex) {
			var vals=$('#audio-fliter').val().split(',');
			if(vals.indexOf('-1')!=-1)// indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
			return true;
			
			
			var state=table.row( dataIndex ).data()[2];
			var result=/.*state="(.*)".*/.exec(state)[1];
			if(vals.indexOf(result)==-1)
				return false;
			return true;
	});
	
	//模拟添加数据
	// for(var i = 0; i < 100; i++) {
	// 		AddListForChecker(Math.floor(Math.random()*12345),"小明",Math.floor(Math.random()*2));
	// }
	//从服务器获取数据
	connect();
	
	$('#search-button').on('click', function() {

		table.search($('#search-input').val()).draw();

	});

	
	//进行过滤
	$("#audio-fliter").on('change', function() {
		table.search($('#search-input').val()).draw();//表格的重新加载？
	});
	
		$("#audio-all").show();
	//交互出了问题
	//连接后端
//0	|	[int]	|	待定
//1	|	[int]	|	平台管理员
//2	|	[int]	|	验收员
//3	|	[int]	|	渠道管理者
//4	|	[int]	|	标注员
//5	|	[int]	|	质检员
	/*批量增加*/
	MoreAdd();
	/*单个增加*/
	SingleAdd();
		
	/*单个删除*/
	$("#table-body").on('click', '.let', function () {
		var tables = $('#audio-table').DataTable();
		var data1 = tables.row( $(this).parents('tr') ).data();
		var getuser = data1[0];
		var $prompt = $('#my-confirm');
		var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
		var achieveOne = 1//解决多次弹出删除失败
		$confirmBtn.off('click.confirm.modal.amui').on('click', function () {
			if(achieveOne==1)
			achieveOne=0;
			else
			return;
			$.ajax({
				type: "post",
				url: baseUrl + 'api/user/delete',
				data: {
					account: getuser
				},
				success: function (state) {
					if (state == 1) {
						alert("删除成功！");
						window.parent.LoadPage('backstage.html');
					}
					else if (state == 2) {
						alert("删除失败！");
					}
					else {
						alert("数据传输错误！");
					}
				},
				error: function () {
					alert("连接失败");
					return ;
				}
			});
		});
		//select(getuser);
		
		//alert(data[0]);
	});

	/*编辑*/
	
	$("#table-body").on('click', '.editor', function () {
		// console.log('123');
		var tables = $('#audio-table').DataTable();
		var data1 = tables.row($(this).parents('tr')).data();
		var getrole = 0;//待定
		var getstate = 0;//待定
		$("#editor-user").val(data1[1]);
		if(data1[2].indexOf('4')>=0){
			getrole = 4;
		}
		if(data1[2].indexOf('5')>=0){
			getrole = 5;
		}
		if(data1[2].indexOf('2')>=0){
			getrole = 2;
		}
		if(data1[2].indexOf('3')>=0){
			getrole = 3;
		}
		var tempPwd="";
		for(var i=0;userdata.length;i++){
			// console.log(userdata[i].account);
			// console.log(data1[0]);		
			if(userdata[i].account==data1[0]){
				tempPwd = userdata[i].pwd;
				break;
			}
		}
		$("#editor-role").val(getrole);
		$("#editor-password").val(tempPwd);
		$("#editor-code").val(100);
		// if(data1[3].indexOf('0')>=0){
		// 	getstate = 0;
		// }
		// else{
		// 	getstate = 1;
		// }
		$("#editor-state").val(getstate);
		$('#btn_revise').on('click',function(e){
			e.stopPropagation();
		var getuser = $("#editor-user").val();
		var getpassword = $("#editor-password").val();
		var getrole = $("#editor-role").val();
		var getcum = $("#editor-code").val();
		var num =/^[A-Za-z0-9]+$/;
		if(getuser==''||getpassword==''||getcum=='')
			{
				alert("不允许有空行！");
				e.stopPropagation();
				return;
		}else{	
		if(getpassword.length>=6&&getpassword.length<=10&&num.test(getpassword)==true){
    // do something
			var submitdata = '{' +
			'"newnick":"' + getuser + '",' +
			'"newpwd":"' + getpassword + '",' +
			'"power":"' + getrole + '",' +
			'"proportion":"' + getcum +
			'"}';

		$.ajax({
			type:"post",
			url: baseUrl +'api/user/edit',
			data:{
				account:data1[0],
				data:submitdata
			},
			success: function(){
				alert("编辑成功！");
				window.parent.LoadPage('backstage.html');
			},
			error:function(){
				alert("连接失败");
				window.parent.LoadPage('backstage.html');
			}
		});
			
		}else{
			alert("格式有误！");
			e.stopPropagation();
			return;
		}
		}
	});
		
			
		
	});
	//设置绩效
	$("#table-body").on('click', '.read', function () {
		console.log('12');	
		var tables = $('#audio-table').DataTable();
		var data1 = tables.row($(this).parents('tr')).data();
		for(var i =0;i<userdata.length;i++){
			console.log(data1[i]);
			console.log(userdata[i].account);
			if(data1[0]==userdata[i].account){
			$("#valTime").val(userdata[i].info.valTime);
			$("#allTime").val(userdata[i].info.allTime);
			$("#rettimes").val(userdata[i].info.rettimes);
			$("#num_done").val(userdata[i].info.num_done);
			$("#num_back").val(userdata[i].info.num_back);
			$("#num_on").val(userdata[i].info.num_on);
			$("#num_wait").val(userdata[i].info.wait);
		}
		}
	});
	
});
/*
 user:[
    {
        account:"d123456",//账号
        pwd:"33234dd",//密码
        nick:"用户名即昵称",//昵称(用户名)
        role:2,//角色权限
        state:1,//1正常 0冻结
        info:{//绩效
        "valTime":27.2621,//有效时长（小时数,保留4位小时）
        "allTime":98.1562,//停留在标注页面的时长（小时数,保留4位小时）
        "rettimes":3,//打回次数 (标注员、质检员 才有此项次数,其它角色可默认为0)
        "num_done":56,//完成的数目
        "num_back":10,//待修改的数目
        "num_on":5,//待提交的数目
        "num_wait":5//等待审核的数目（等待质检+验收）
         }
*/ 

//连接后台
function connect(){
	$.ajax({
		type:"post",
		url: baseUrl +'api/user/getUsers',
		success:function(data){
			data=JSON.parse(data);
			userdata=data['user'];
			data=data['user'];
			// console.log(data);
			for(var i =0;i<data.length;i++){
				AddListForChecker(data[i].account, data[i].nick, data[i].role, data[i].stage);
				// console.log(data[i].role);
			}
		},
		error:function(){
			alert("连接失败");
		}
	});
}

//编辑
function editor(){
	
	var $prompt = $('#my-editor');
  	var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
  	// $confirmBtn.off('click.confirm.modal.amui').on('click', function(e) {
}




//删除
function select(Account){
	var $prompt = $('#my-confirm');
  	var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
  	$confirmBtn.off('click.confirm.modal.amui').on('click', function() {
	// do something
	console.log('123');
		$.ajax({
			type:"post",
			url: baseUrl +'api/user/delete',
			data:{
				account:Account	
			},
			success: function(state){
				if(sate==1){
					alert("删除成功！");
					console.log("success");
					window.parent.LoadPage('backstage.html');
				}
				else if(state==2){
					alert("删除失败！");
				}
				else{
					alert("数据传输错误！");
				}
			},
			error:function(){
				alert("连接失败");
			}
		});
	});
}
function MoreAdd(){
	/*批量增加*/
	//data-am-modal-confirm
	var $prompt = $('#my-prompt');
  	var $confirmBtn = $prompt.find('[data-am-modal-confirm]');
	pclear($("#p-qian"),$("#p-cum"),$("#p-password"));
  	$confirmBtn.off('click.confirm.modal.amui').on('click', function(e) {
    // do something
		var more = 1;
		var qian = $("#p-qian").val();
		var sum = $("#p-cum").val();
		var role = $("#p-role").val();
		var password = $("#p-password").val();
		var num =/^[A-Za-z0-9]+$/;
		var pre = /^[A-Za-z]+$/;
		if(sum==''||password==''||qian==''){
			alert("请输入数量或初始密码或前缀");
			e.stopPropagation();
			return;//阻止事件扩散到父类
		}else{
			//得用正则表达式来判断密码的格式是否正确
			if(sum>=2&&sum<=99&&password.length>=6&&password.length<=10&&num.test(password)==true&&qian.length>=3&&qian.length<=7&&pre.test(qian)==true){
				var submitdata = '{' +
				'"prefix":"' + qian + '",' +
				'"count":"' + sum + '",' +
				'"pwd":"' + password +'",'+
				'"power":"' + role +'"}';

				$.ajax({
					type:"post",    
					url: baseUrl +'api/user/add',    
					data:{
						single:0,
						data:submitdata
					}, 
					success:function(res) {
					   if(res==0){
							 alert("前缀重复！");
						   e.stopPropagation();
					   }
						else if(res==2){
							alert("添加成功");
							window.parent.LoadPage("backstage.html");

						}
						else{
							alert("返回数据错误！");
							 e.stopPropagation();
						}
					},
					error:function() { 
						alert("连接失败");
						pclear($("#p-qian"),$("#p-cum"),$("#p-password"));
				   } 
				});
			}else{
				alert("输入格式错误");
				e.stopPropagation();
			}
		}
	});
	
	
}
function pclear($a,$b,$c){
	$a.val('');
	$b.val('');
	$c.val('');
}
function sclear($a,$b){
	$a.val('');
	$b.val('');
}
function SingleAdd(){
	//单个增加
		var $myalert = $('#my-alert');
  		var $myalertBtn = $myalert.find('[data-am-modal-confirm]');
		sclear($("#single-user"),$("#single-password"));
  		$myalertBtn.off('click.confirm.modal.amui').on('click', function(e) {
    	// do something
    	console.log('test');
		var Suser = $("#single-user").val();
		var Srole = $("#single-role").val();
		var Spassword = $("#single-password").val();
		var num =/^[A-Za-z0-9]+$/;
		if(Suser==''||Spassword==''){
			alert("请输入用户名或初始密码");
			e.stopPropagation();
			return;//阻止事件扩散到父类
		}else{
			//得用正则表达式来判断密码的格式是否正确
			if(Spassword.length>=6&&Spassword.length<=10&&num.test(Spassword)==true&&Suser.length>=3&&Suser.length<=10&&num.test(Suser)==true){
				console.log('success');
				var submitdata = '{' +
				'"account":"' + Suser + '",' +
				'"pwd":"' + Spassword + '",' +
				'"power":"' + Srole +
				'"}';

				$.ajax({
					type: "post",
					url: baseUrl + 'api/user/add',
					data:{
						single:1,
						data:submitdata
					},
					success:function(rel){
						if(rel==1){
							alert("账号重复，请重新输入账号！");
							a.stopPropagation();
						}
						else if(rel==2){
							alert("添加成功");
							window.parent.LoadPage("backstage.html");

						}
					},
					error:function(){
						alert("连接失败");
						sclear($("#single-user"),$("#single-password"));
					}
					});
			}else{
				alert("输入格式错误");
				e.stopPropagation();
			}
		}
  	});
}
function Init_auth() {
	$("#audio-fliter").empty();
	$("#table-head").empty();
	$(".role").empty();
	switch(roleauto){
		case 1:
			$("#audio-fliter").append('<option value="-1">所有</option>');
			$("#audio-fliter").append('<option value="2">验收员</option>');
			$("#audio-fliter").append('<option value="3">渠道</option>');
			$("#table-head").append('<th>账号</th><th>用户名</th><th>角色</th><th>操作</th>');
			$(".role").append('<option value="2">验收员</option>');
			$(".role").append('<option value="3">渠道</option>');
			break;
		case 3:
			$("#audio-fliter").append('<option value="-1">所有</option>');
			$("#audio-fliter").append('<option value="5">质检员</option>');
			$("#audio-fliter").append('<option value="4">标注员</option>');
			$("#table-head").append('<th>账号</th><th>用户名</th><th>角色</th><th>操作</th>');
			$(".role").append('<option value="5">质检员</option>');
			$(".role").append('<option value="4">标注员</option>');
			break;		
	}
}

// //获取状态文本
// function GetRole1(role){
// 	var str_role = "未知角色";
// 	 var sa = 0;
// 	switch(role){
// 		case 0:
// 			str_role = "验收员";
// 			sa = 2;
// 			break;
// 		case 1:
// 			str_role = "渠道";
// 			sa = 3;
// 			break;
// 	}
// 	return '<div class="" state="'+sa+'">'+str_role+'</div>';
// }

//获取状态文本
function GetRole1(role) {
	var str_role = "未知角色";
	var sa = 0;
	switch (role) {
		case 2:
			str_role = "验收员";
			sa = 2;
			break;
		case 3:
			str_role = "渠道";
			sa = 3;
			break;
	}
	return '<div class="" state="' + sa + '">' + str_role + '</div>';
}

function GetRole2(role){
	var str_role = "未知角色";
	var sa = 0;
	// console.log(role);
	switch(role){
		case 5:
			str_role = "质检员";
			sa = 5 ;
			break;
		case 4:
			str_role = "标注员";
			sa = 4 ;
			break;
	}
	return '<div class="" state="'+sa+'">'+str_role+'</div>';
}



function AddListForChecker( id,user,role,state) {
	var str_role;
	if(roleauto==1)
	{
		// console.log(role);
		str_role=GetRole1(role);
	}
	else{
		// console.log(role);
		str_role=GetRole2(role);
	}
	var myconfirm = "'#my-confirm'";
	var mystate = "'#my-editor'";
	var myread = "'#my-read'";
	var button = '<td><div class="tpl-table-black-operation"><a  class="editor" href="javascript:;" data-am-modal="{target:'+mystate+'}"> <i class="am-icon-pencil"></i> 编辑 </a> <a  class="read" href="javascript:;" data-am-modal="{target:'+myread+'}"><i class="am-icon-leanpub"></i> 绩效</a> <a href="javascript:;"  data-am-modal="{target:'+myconfirm+'}" class="tpl-table-black-operation-del let" ><i class="am-icon-trash"></i> 删除</a></div></td>';
	var rowNode = table
		.row.add([
			 id,
			 user,
			 str_role,
			 button
		])
		.draw()
		.node();

	$(rowNode)
		.css('class','gradeX')
}