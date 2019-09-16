document.addEventListener('DOMContentLoaded', function() {
	var baseUrl = window.parent.baseUrl;
	var nowAudio = window.parent.AudioId; //当前操作的音频的id

	var account=window.parent.account;
	var token=window.parent.token;
	var originAudios=window.parent.originAudios;
	//获取权限变量
	var auth = window.parent.auth;

	var audioPronum=sessionStorage.getItem("audioPro");//当前音频对应的项目
	var taskId=sessionStorage.getItem("taskId");

	var goOn = window.parent.goOn;//是否是继续做的音频
	var wavesurfer = null;//初始化wavsurfer对象
	// var cutAudioStatus='CUTAUDIO_OLD';
	var  isClick=false;
	var nowplayRegion=null;
	var tempInterval=null;
	var tempIndex=0;
	/**
	 * 停止音频播放
	 */
	function pauseAudio(){
		wavesurfer.pause();
	}

	var regionTimer=null;
	/**
	 * 定时器阻断播放播放
	 * @param start
	 * @param end
	 */
	function playRange(start,end){
		isClick=false;
		if(regionTimer!=null){
			window.clearTimeout(regionTimer);
		}
		var timeout=Number(parseFloat(end - start).toFixed(3)*1000);
		regionTimer=setTimeout(pauseAudio,timeout);
		wavesurfer.play(start,end);
	}

	document.onkeydown = function (event) {//绑定按键触发时间
		var e = event || window.event;
		var keyCode = e.keyCode || e.which;
		switch (keyCode) {
			case 113:
				if(nowplayRegion==null)
					return;
				// nowplayRegion.play();
				var start=nowplayRegion.start;
				// // var end=(nowplayRegion.end).toFixed(1);
				// var end=nowplayRegion.end-keytime;
				var end=nowplayRegion.end;
				// wavesurfer.play(start,end);
				playRange(start,end);
				// console.log(start+"/"+end);
				event.stopPropagation();
				break;

			case 17:
				$("#waveStart").click();
				// console.log(wavesurfer.getCurrentTime());
				// event.stopPropagation();
				break;

			default:
				break;
		}
	};

	// CUTAUDIO_NEW=0;
	// CUTAUDIO_MODIFY=1;
	// 开启定时提醒保存

	// setInterval(showTips, 600000, "已经过去10分钟,请及时保存,以防数据丢失");

	/**
	 * 加载音频列表
	 */
	addAudiosNum(originAudios);

	/**
	 * 加载噪音符号
	 */
	loadEmoji();

	/**
	 * 加载新的音频
	 * @param url
	 */
	function changeAudio(url) {
		// console.log(url);
		if(wavesurfer!=null){
			wavesurfer.destroy();
		}
		wavesurfer = createWavesurfer();
		waveBindEvent(wavesurfer);
		// wavesurfer.load("source/audio/test1.wav");

		let xhr = new XMLHttpRequest();
		xhr.open(
			"GET",
			url,
			true
		);
		xhr.responseType = "arraybuffer";
		xhr.setRequestHeader("x_hztz_token",token);
		xhr.onload = function() {
			let type = xhr.getResponseHeader("Content-Type");
			let blob = new Blob([this.response], { type: type });
			wavesurfer.load(URL.createObjectURL(blob));

		};
		xhr.send();
		//动态提示
		tempInterval=setInterval(function () {
			tempIndex=(tempIndex+1)%5;
			let str="";
			for(let i=0;i<=tempIndex;i++){
				str+=".";
			}
			resetTips('音频下载中'+str);
		},400);

	}

	if(window.parent.auth == 4) {
		$('#submit-check').html("完成验收");
	}

	//获取子元素个数
	function getChildrenCount(id) {
		return($('#' + id).children().length + 1);
	}

	//重置序号
	function resetSerialNum(classname) {
		var reglen = $(classname).length;
		var SerialNum = $(classname);
		for(i = 0; i < reglen; i++) {
			SerialNum.eq(i).html((i + 1));
		}
	}

	//移除一个标注
	function delMark(regid) {
		regIDarray.splice($.inArray(regid, regIDarray), 1); //删除数组中已有的id选区
		reglen--;
		var reg = wavesurfer.regions.list; //获取到region对象
		reg[regid].remove();
		$('li.mark-text-panel[region-id=' + regid + ']').remove(); //移除标注文本输入面板
		$('.order-num[region-id=' + regid + ']').remove(); //移除句子列表中对应的序号
		resetSerialNum('.SerialNum'); //重置标注区域序号
		resetSerialNum('.order-num'); //重置句子列表序号
	}

	//选取id数组
	var regIDarray = new Array();
	var reglen = 0;
	//判断选区是否重复
	function isOverlayReg(region) {
		var nowStart = region.start;//当前选区开始的时间
		var nowEnd = region.end;//当前选区停止的时间
		var reg = wavesurfer.regions.list;//获取当前已有的region区域列表


		for (var i = 0; i < reglen; i++) {//遍历获取的region对象数组
			var key = reg[regIDarray[i]];
			var kStart = key.start;
			var kEnd = key.end;
			//重叠的三种情况
			var scene1 = (nowStart > kStart && nowStart < kEnd);
			var scene2 = (nowEnd > kStart && nowEnd < kEnd);
			var scene3 = (nowStart < kStart && nowEnd > kEnd);
			// console.log(scene1 + "-" + scene2 + "-" + scene3);
			if(scene1){
				region.onResize(kEnd-nowStart,'start');
			}
			if(scene2){
				region.onResize(kStart-nowEnd,'end');
			}
			if (scene1 || scene2 || scene3) {//满足上面任意条件之一
				return true;
			}
		}
		return false;
	}

	function getAllMarkdata() {
		var submitData ='{ "data":[';
		var reg = wavesurfer.regions.list;
		for(var i = 0; i < reglen; i++) {
			var key = reg[regIDarray[i]];
			var start = key.start;
			var end = key.end;
			var $li_notes = $('#mark-text-list li[region-id=' + key.id + ']').find('.notes').children();
			var text = "";
			var reason = "";
			var sex = "";
			var role = "";
			sex += $li_notes.eq(0).children().html();
			role += $li_notes.eq(1).children().html();
			reason += $li_notes.eq(2).children().html();
			text += $('textarea[reg-id=' + key.id + ']').val();
			var temp = '{ "start":' + start + ',"end":' + end + ',"text":"' + text + '","reason":"' + reason + '","addition":{"sex":"' + sex + '","speaker":"' + role + '"}},'
			submitData += temp;
		}
		submitData = submitData.substring(0, submitData.length - 1);
		submitData += "]}";
		return submitData;
	}

	

	// 开始-暂停音频
	$('#waveStart').on('click', function() {
		wavesurfer.playPause();
	});

	//通过句子序号选择标注区域
	$('#mark-order-list').on('click', 'li', function() {
		var regionId = $(this).attr('region-id');
		//播放选区
		var reg = wavesurfer.regions.list; //获取到region对象
		reg[regionId].play();
		//获取当前播放的region对象
		var $region = $('region[data-id=' + regionId + ']');
		$region.addClass('region-active').siblings().removeClass('region-active').end();
		//提示对应的标注输入框
		$('li.mark-text-panel[region-id=' + regionId + ']').find('textarea').focus();
	});

	//通过按钮播放选区
	$('#mark-text-list').on('click', '.play-mark', function() {
		var regionId = $(this).parents('li').attr("region-id"); //获取到绑定的region的id
		var reg = wavesurfer.regions.list; //获取到region对象
		reg[regionId].play();
		//获取当前播放的region对象
		var $region = $('region[data-id=' + regionId + ']');
		$region.addClass('region-active').siblings().removeClass('region-active').end();
		// console.log(list.start+"--"+list.end);
	});

	//标注内容确定
	$('#mark-text-list').on('click', '.sure-mark', function() {
		var $li = $(this).parents('li');
		var regionId = $li.attr("region-id"); //获取到绑定的region的id
		var $orderNum = $('.order-num[region-id=' + regionId + ']'); //获取到对应的序号
		var $li_notes = $li.find('.notes').children();
		var $li_tips=$li_notes.parent().next().children();
		var $textArea=$('textarea[reg-id=' + regionId + ']');
		var cutaudioNum=$li.attr('cutaudio-num');

		var reg = wavesurfer.regions.list; //获取到region对象
		reg=reg[regionId];
		var subData={
			"startTime":reg.start,
			"endTime":reg.end,
			"text":JSON.stringify({
				"text":$textArea.val(),
				"label":JSON.parse($li_notes.children().attr('value'))
				// "label":$li_notes.children().html()
			}),
			"tips":"",
			"state":0
		};
		console.log(subData);

		///testpart
		// $orderNum.removeClass('un-right');
		// $orderNum.addClass('sure-mark');
		///
		$.ajax({
			url: baseUrl + 'apiproject/audio/cutaudio/'+cutaudioNum,
			headers: {
				"Content-type": "application/json; charset=utf-8",
				"x_hztz_token": token
			},
			type: 'PUT',
			data:JSON.stringify(subData),
			success: function (res) {
				// console.log(res);
				$orderNum.removeClass('un-right');
				$orderNum.addClass('sure-mark');
			},
			error: function () {
				alert('网络错误');
			}
		});

	});
	//标注内容不合格
	$('#mark-text-list').on('click', '.unqualified', function(e) {

		var $li = $(this).parents('li');
		var regionId = $li.attr("region-id"); //获取到绑定的region的id
		var $orderNum = $('.order-num[region-id=' + regionId + ']'); //获取到对应的序号
		var $reason = $li.find('.tips').children().children(); //获取到原因的对象
		var $li_notes = $li.find('.notes').children();
		var $li_tips=$li_notes.parent().next().children();
		var $textArea=$('textarea[reg-id=' + regionId + ']');
		var cutaudioNum=$li.attr('cutaudio-num');
		//打开弹出层
		$('#doc-modal-1').modal({
			closeViaDimmer: false //设置点击遮罩层无法关闭
		});
		$('#doc-modal-1').modal('open');
		$('#sure-reason').unbind('click');
		$('#sure-reason').on('click', function() {

			var reason = $(this).prev().val(); //不合格原因
			if(reason == null || reason == "")
				return;
			else {
				var reg = wavesurfer.regions.list; //获取到region对象
				reg=reg[regionId];
				$reason.html(reason);
				$('#doc-modal-1').modal('close');
				var subData={
					"startTime":reg.start,
					"endTime":reg.end,
					"text":JSON.stringify({
						"text":$textArea.val(),
						"label":JSON.parse($li_notes.children().attr('value'))
						// "label":$li_notes.children().html()
					}),
					"tips":$li_tips.children().html(),
					"state":1
				};
				console.log(subData);
				// ///testpart
				// $orderNum.addClass('un-right');
				// $orderNum.removeClass('sure-mark');
				///
				$.ajax({
					url: baseUrl + 'apiproject/audio/cutaudio/'+cutaudioNum,
					headers: {
						"Content-type": "application/json; charset=utf-8",
						"x_hztz_token": token
					},
					type: 'PUT',
					data:JSON.stringify(subData),
					success: function (res) {
						console.log(res);
						$orderNum.addClass('un-right');
						$orderNum.removeClass('sure-mark');
					},
					error: function () {
						alert('网络错误');
					}
				});

			}
		})
	});

	//波形缩放区域
	// var startlvl = wavesurfer.params.minPxPerSec;
	// console.log(startlvl);
	// var zoominbutton = $('button[data-action="zoomin"]');
	// zoominbutton.on('click', function() {
	// 	zoomoutbutton.attr("disabled", false);
	// 	var lvl = wavesurfer.params.minPxPerSec;
	// 	lvl *= 1.2;
	// 	console.log(lvl);
	// 	wavesurfer.zoom(lvl);
	// });
	//
	// var zoomoutbutton = $('button[data-action="zoomout"]');
	// zoomoutbutton.on('click', function() {
	// 	// console.log(lvl);
	// 	// zoominbutton.disabled = false;
	// 	var lvl = wavesurfer.params.minPxPerSec;
	// 	lvl /= 1.2;
	// 	console.log(lvl);
	// 	if(lvl <= startlvl) {
	// 		zoomoutbutton.attr('disabled', true);
	// 		wavesurfer.zoom();
	// 	} else {
	// 		wavesurfer.zoom(lvl);
	// 	}
	// });

	/**
	 * 一键打回
	 */
	$('#goout-check').on('click', function() {
		openModel("#goout-modal",false);

		$('#sure-goout').unbind('click');
		$('#sure-goout').on('click',function () {
			console.log($(this).prev().val());
		});
		//waitImprove
		// return;
		switch(auth){
			case 5:
				changeTaskState(3);
				break;
			case 4:
				changeTaskState(4);
				break;
		}
	})

	/**
	 * 完成质检/验收
	 */
	$('#submit-check').on('click', function() {
		var proportion= sessionStorage.getItem("proportion");
		const amountCount=$('#mark-order-list').children().length;
		const alreadyCheckCount=$('#mark-order-list').children('li.sure-mark,li.un-right').length;
		if($('#mark-order-list').children('li.un-right').length!=0){
			if(!confirm("你当前有:"+$('#mark-order-list').children('li.un-right').length+"条不合格数据,是否确认完成")){
				return;
			}else{
				switch(auth){
					case 5:
						changeTaskState(3);
						break;
					case 4:
						changeTaskState(4);
						break;
				}
			}
		}

		switch(auth){
			case 5:
				if(alreadyCheckCount>=Math.ceil(amountCount*proportion/100)){

					changeTaskState(1);
				}else{
					alert("你还需要质检:"+Number(Math.ceil(amountCount*proportion/100)-alreadyCheckCount)+"条,才能达到要求的比例");
				}
				break;
			case 4:
				if(alreadyCheckCount>=Math.ceil(amountCount*proportion/100)){
					changeTaskState(2);
				}else{
					alert("你还需要验收:"+Number(Math.ceil(amountCount*proportion/100)-alreadyCheckCount)+"条,才能达到要求的比例");
				}
				break;
		}

	});

	/**
	 * 切换音频
	 */
	$('#audios-list').on('click', 'li', function (res) {
		console.log("切换音频");
		$('#save-mark').click();//保存当前音频的数据

		var reg = wavesurfer.regions.list;//获取到region对象

		regIDarray.forEach(function (key) {
			reg[key].remove();
		});

		$('#mark-text-list').empty();
		$('#mark-order-list').empty();

		regIDarray=new Array();
		reglen = 0;

		var audioid=$(this).attr("id");
		console.log(audioid);
		wavesurfer.destroy();
		window.parent.AudioId=audioid;
		window.parent.LoadPage("checkAudio.html");
	});

	/**
 * 通过音频id获取验收比例
 * @param {音频id} audioid 
 */
	function getProportion(audioid) {
		$.ajax({
			url: baseUrl + "api/audio/getProportion",
			type: 'post',
			data: {
				id: audioid
			},
			success: function (data) {
				$('#audio-Proportion').html(data + '%');
			}
		})
	}

	/**
	 * 更改任务状态
	 */
	function changeTaskState(state) {
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
					window.parent.LoadPage("audios.html");
				}
			},
			error: function () {
				alert('网络错误');
			}
		});
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
	 * 计算两个日期(Date)对象的时间间隔
	 * @param {开始的日期} startDate 
	 * @param {结束的日期} endDate 
	 * @param {返回值类型 1.天 2.时 3.分 4.秒} type 
	 */
	function dateInterval(startDate, endDate, type) {
		var temp = (endDate.getTime() - startDate.getTime()) / 1000; //日期差(秒)
		switch(type) {
			case 1:
				return(temp / (3600 * 24));
				break;
			case 2:
				return(temp / 3600);
				break;
			case 3:
				return(temp / 60);
				break;
			case 4:
				return temp;
				break;
			default:
				return -1;
				break;
		}
	}

	//小音频片段
	var cutAudioVOS=null;
	/**
	 * 加载音频列表
	 * @param {Array} urlarray 音频列表数组
	 */
	function addAudiosNum(urlarray) {
		for (let index = 0; index < urlarray.length; index++) {
			let $temp = '<li projectId="'+urlarray[index].projectNum+'" class="audio-num" id="' + urlarray[index].audioId + '">' + Number(index + 1) + '</li>';
			$('#audios-list').append($temp);
		}
		//获取第一条音频数据
		$.ajax({
			url: baseUrl + 'apiproject/audio/' + nowAudio,
			type: "GET",
			headers: {
				"Content-type": "application/json; charset=utf-8",
				"x_hztz_token": token
			},
			success: function (res) {
				// console.log(res);
				cutAudioVOS=res.cutAudioVOS;
				/**
				 * 加载音频
				 */
				changeAudio(baseUrl+"apiproject/audio"+res.audioURL);
			},
			error: function () {
				alert("连接失败");
			}
		});

	}

	/**
	 * 加载表情符号
	 */
	function loadEmoji() {
		//加载标签 audioPronum
		$.ajax({
			url: baseUrl+"apiproject/emotion/"+audioPronum+"/0",
			type: "GET",
			headers:{
				"x_hztz_token": token
			},
			dataType: "json",
			success: function (res) {
				res=JSON.parse(res.data);

				labelData = res;
				$('#labels').empty();
				for (var i = 0; i < res.length; i++) {
					var $li = '<optgroup label="' + res[i].title + '">';
					for (var j = 0; j < res[i].data.length; j++) {
						$li += '<option value="' + res[i].title + "#" + res[i].data[j] + '">' + res[i].data[j] + '</option>';
					}
					$li += '</optgroup>';
					$('#labels').append($li);
				}
			},
			error: function (res) {
				console.log("getError")
			}
		});

		//加载噪音符号
		$.ajax({
			url: baseUrl+"apiproject/emotion/"+audioPronum+"/1",
			headers:{
				"x_hztz_token": token
			},
			type: "GET",
			dataType: "json",
			success: function (res) {
				res=JSON.parse(res.data);
				// console.log('getsuccess');
				$('#audiochar').children().remove();
				var $li = '';
				for (var i = 0; i < res.length; i++) {
					$li = '<li><i>||[' + res[i].key + ']||</i><span>' + res[i].value + '</span></li>';
					$('#audiochar').append($li);
				}
			},
			error: function (res) {
				console.log("geterror");
			}
		})
	}

    /**
     * 创建wavesurfer对象
     */
	function createWavesurfer() {
		return WaveSurfer.create({
			// Use the id or class-name of the element you created, as a selector
			container: '#waveform',
			// The color can be either a simple CSS color or a Canvas gradient
			progressColor: 'rgba(255,0,0,0.3)',
			cursorColor: 'black',
			// This parameter makes the waveform look like SoundCloud's player
			// barWidth: 1,
			// barHeight: 3,
			waveColor: '#A8DBA8',
			backend: 'MediaElement',
			responsive: 100,
			minPxPerSec: 150,
			height:256,
			// forceDecode: 'true',
			plugins: [
				WaveSurfer.regions.create({
					dragSelection: false, //是否允许鼠标拖拽创建
					color: "rgba(0,0,0,0.7)",
					drag: false, //是否允许拖动区域
					resize: false, //是否允许调整区域
					loop: false, //循环播放此区域 bug手动都跳不出来
				}),
				WaveSurfer.timeline.create({
					container: '#wave-timeline',
					height: 30,
					notchPercentHeight: 90,
					unlabeledNotchColor: '#c0c0c0',
					primaryColor: '#fff',
					secondaryColor: '#c0c0c0',
					primaryFontColor: '#fff',
					secondaryFontColor: '#fff',
					fontSize: 15,
				}),
			]
		});
	}
    /**
     * 为wavesurfer绑定必要的事件
     * @param {wavesurfer} waveObgect 
     */
	function waveBindEvent(waveObgect) {
		//进度条
		waveObgect.on('loading',function (res) {
			if(tempInterval){
				clearInterval(tempInterval);
				tempInterval=null;
			}
			resetTips('音频加载中');
			// console.log(res);
			resetTips('音频加载:'+res+'%');

			// $('#load-rate').html('音频加载:'+res+'%');
			if(res==100){
				// resetTips('波形绘制中');
				tempInterval=setInterval(function () {
					tempIndex=(tempIndex+1)%5;
					let str="";
					for(let i=0;i<=tempIndex;i++){
						str+=".";
					}
					resetTips('波形绘制中'+str);
				},400);
			}
		});


		waveObgect.on('ready', function () {
			waveObgect.zoom(waveObgect.params.minPxPerSec*1.3);
		});

		waveObgect.on('waveform-ready',function () {
			// console.log("success2");
			clearInterval(tempInterval);
			tempInterval=null;
			resetTips('波形绘制完成');
			// goOn=false;
			loadOriginData("filename");
		});

		waveObgect.on('region-out',function (region) {
			// waveObgect.pause();
			if(isClick&&waveObgect.getCurrentTime()+0.2>=nowplayRegion.end){
				waveObgect.pause();
				isClick=false;
			}
		});

		waveObgect.on('region-click',function (region,e) {
			isClick=true;
			nowplayRegion=region;

			setTimeout(function () {
				var temp=waveObgect.getCurrentTime();
				var end=region.end;
				waveObgect.play(temp,end-0.025);


			},15);


			$('li.mark-text-panel[region-id=' + region.id + ']').find('textarea').focus();
			//获取当前region对象
			var $region = $('region[data-id=' + region.id + ']');
			$region.addClass('region-active').siblings().removeClass('region-active').end();


		})


		//创建新的选区时触发
		waveObgect.on('region-created', function (region) {
			var $reg = $('region[data-id=' + region.id + ']');
			//显示时间
			var temp='<div class="time" style="color: #fff;position: absolute;bottom: 5px;width:  100%;text-align:  center;z-index: -10;"><p style="word-break:  break-all;">'+(region.end-region.start).toFixed(6)+'</p></div>';
			$reg.append(temp);
			//显示序号
			var num=getChildrenCount('mark-text-list');
			temp='<span class="region-num" style="position: absolute;z-index: 10;background-color:#5eb95e;display: block;min-width: 2rem;left:calc(44% - 1rem) ;top: 0;text-align: center;color: #fff;"> '+num+'</span>';
			$reg.append(temp);
			if ($.inArray(region.id, regIDarray) < 0) { //如果该选区不存在
				//将新的选取id录入
				reglen = regIDarray.push(region.id);
				//新增标注文本录入区域
				var $li = '<li class="mark-text-panel am-padding-sm am-margin-top" ' + 'region-id=' + region.id + '>' +
					'<i class="SerialNum">' +
					getChildrenCount('mark-text-list') +
					'</i >' +
					' <section class="mark-input-text">' +
					'<div>' +
					'<label class="am-margin-left-sm">' +
					' 文本: <textarea  placeholder="在此输入音频内容,不能为空" reg-id=' + region.id + '></textarea>' +
					'</label>' +
					'<div class="btn-box">' +
					'<button class="play-mark am-btn am-round am-btn-secondary">播放</button>' +
					' <button class="am-margin-sm sure-mark am-btn am-round am-btn-success">合格</button>' +
					'<button class="am-margin-sm am-btn am-round am-btn-danger unqualified">不合格</button>' +
					'</div>' +
					'</div>' +
					'<div class="am-margin-top notes">' +
					' <div hidden class="mark-tip am-padding-left-sm">标签:&nbsp;&nbsp;<span class="am-badge am-badge-secondary am-radius" value="[]"></span></div>' +
					'</div >' +
					'<div class="am-margin-top-sm tips">' +
					'<div hidden="" class="mark-tip am-padding-left-sm">备注:&nbsp;&nbsp;<span ' +
					' class="am-badge am-badge-danger am-radius"></span></div>' +
					'</div>'+
					'</section>' +
					'</li >';
				$('#mark-text-list').append($li);

				//为新增的绑定textarea禁用右键默认菜单
				$('textarea[reg-id=' + region.id + ']').bind("contextmenu", function () {
					return false;
				})
				/**
				 * 监听输入框输入框鼠标单击事件
				 */
				var areaForMenu = "";
				$('#mark-text-list').on('mousedown', 'textarea', function (event) {
					var e = event || window.event;
					var code = e.which || e.keyCode;
					// console.log(code);
					switch (code) {
						case 3:
							//    console.log(event.screenX+"---"+event.screenY);
							$('#zz').show();
							$('#audiochar').css("left", event.pageX + 10 + "px");
							$("#audiochar").css("top", event.pageY + 10 + 'px'); //设置 出现的位置
							break;
						default:
							break;
					}
					var text = $(this).val();
					/**
					 * 选择噪音符号
					 */
					areaForMenu = $(this);
					$('#audiochar').on('click', 'li', function (event) {
						areaForMenu.val(text + $(this).children('i').html());
					})
				})
				/**
				 * 隐藏遮罩层
				 */
				$('#zz').on('click', function () {
					$(this).hide();
				})
				$('#zz').on('contextmenu', function () {
					return false;
				})
				//新增的句子列表序号
				$li = '<li class="order-num" region-id=' + region.id + '>' +
					getChildrenCount('mark-order-list') + '</li>'
				$('#mark-order-list').append($li);
			}
			//当选区发生拖拽或者移动之后
			region.on('update-end', function () {
				//更新时长
				$reg.children('.time').children().html((region.end-region.start).toFixed(6));
			});



		});
	}

	/**
	 * 加载原始音频数据
	 * @param filename 文件名称
	 */
	function loadOriginData(filename) {
		resetTips('加载选区中');
		if(goOn===true){
			var res=cutAudioVOS;
			// console.log(res);
			var tempId='waveRegion';
			for (var i = 0; i < res.length; i++) {
				if(res[i].startTime>res[i].endTime){
					resetTips($('#tips').html()+',选区'+(i+1)+'时间节点有误');
				}
				wavesurfer.addRegion({//创建region
					id: tempId+i,
					start: res[i].startTime,
					end: res[i].endTime,
					color: 'rgba(59, 180, 242, 0.3)',
					dragSelection: {//是否能用鼠标滑动选择区域
						slop: 5//占时不知道效果在哪里
					},
					drag: false,//是否允许拖动区域
					resize: true,//是否允许调整区域
					loop: false//循环播放此区域 bug手动都跳不出来
				})
			}

			var $lipanel = "";//获取到新增的标注区域对象
			var $textArea = "";//获取标注区域的textarea
			var $labels = "";//标签内容
			var $tips="";//备注
			var $orderNum="";//序号
			for (var i = 0; i < res.length; i++) {
				$orderNum=$('#mark-order-list li[region-id=' + tempId+i + ']');
				$lipanel = $('#mark-text-list li[region-id=' + tempId+i + ']');
				$textArea = $lipanel.find('textarea');
				$labels = $lipanel.find('.notes');
				$tips=$lipanel.find('.tips');
				let text=JSON.parse(res[i].text);
				//设置对应的值
				$textArea.val(text.text);

				///newFeature
				//存放标签数据
				$labels.find('span').attr('value',JSON.stringify(text.label));
				let tempArr=[];
				const labelArr=text.label;
				labelArr.forEach((key)=>{
					tempArr.push(key.title+":"+key.value);
				});
				$labels.find('span').html(tempArr.length==0?"":tempArr.join(' ,'));
				// $labels.find('span').html(text.label);
				$tips.find('span').html(res[i].tips=="-1"?"":res[i].tips);
				// if(res[i].labels.trim()!=""){
				//     $labels.html(res[i].labels.substr(0,res[i].labels.length-1));
				// }
				$lipanel.attr('cutAudio-num',res[i].num);
				$lipanel.attr('truncateState',2);

				//更改片段的状态
				switch (res[i].state) {
					case 'QUALIFIED':
						$orderNum.addClass('sure-mark');
						break;
					case 'NO_QUALIFIED':
						$orderNum.addClass('un-right');
						break;
					case 'IN_ANNOTATING':
						break;
				}
			}
			goOn = false;
			if(String($('#tips').html())=="加载选区中")
				resetTips('选区加载完成');
		}
	}

	/**
	 * 重置提示内容
	 * @param str
	 */
	function resetTips(str) {
		$('#tips').html(str);
	}

    /**
    * 显示弹窗提醒
    * @param {String} text 弹窗内容 
    */
	function showTips(text) {
		alert(text);
	}

})