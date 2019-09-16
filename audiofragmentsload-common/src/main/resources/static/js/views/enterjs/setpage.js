$(document).ready(function () {
	// var baseUrl = window.parent.baseUrl;

	// $.ajax({
	// 	type:"post",
	// 	url:baseUrl+"api/audio/getProportion2",
	// 	async:false,
	// 	success:function(data)
	// 	{
	// 		$("#search-input").val(data);
	// 	}

	// });





	$("#search-button").click(function () {
		var sum = $("#search-input").val();
		var rProportion = /^\d{1,3}$/;
		if (sum == "" || sum == null) {
			alert("请输入验收比例");
		}
		else if (!rProportion.test(sum)) {
			$("#search-input").val("");
			alert('输入格式错误 Number:(1-100)');
			return;
		} else if (sum < 0 || sum > 100) {
			$("#search-input").val("");
			alert('输入格式错误 Number:(1-100)');
			return;
		}
		else {
			$.ajax({
				type: "post",
				url: baseUrl + "api/audio/setProportion",
				data: {
					proportion: sum
				},
				success: function (data) {
					switch (Number(data)) {
						case 0:
							alert("设置成功!");
							break;
						default:
							alert("设置失败");
							break;
					}

				},
				error: function () {
					alert("连接失败");
					$("#search-input").val("");
				}
			});
		}
	});
});