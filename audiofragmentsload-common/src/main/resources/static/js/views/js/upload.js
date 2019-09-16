var baseUrl = window.parent.baseUrl;
//设置值权限
var token = window.parent.token;
var useraccount = window.parent.account;
var upload_prj=sessionStorage.getItem("uploadPro");
var projectType=sessionStorage.getItem('projectType');
$(document).ready(function () {
    
    //设置进度条
    $.AMUI.progress.configure({
        minimum: 0.1,//设置最小百分比
        easing: 'ease',//动画欢动函数
        positionUsing: '',
        speed: 600,//速度
        trickle: true,
        trickleRate: 0.02,
        trickleSpeed: 800,
        showSpinner: true,
        barSelector: '[role="nprogress-bar"]',
        spinnerSelector: '[role="nprogress-spinner"]',
        parent: '#thelist',//进度条父容器
        template: '<div class="nprogress-bar" role="nprogress-bar">' +
            '<div class="nprogress-peg"></div></div>' +
            '<div class="nprogress-spinner" role="nprogress-spinner">' +
            '<div class="nprogress-spinner-icon"></div></div>'
    })
    var progress = $.AMUI.progress;

    var uploader = WebUploader.create({

        // sendAsBinary:true,
        //选择完文件或是否自动上传
        auto: false,
        //swf文件路径
        swf: '../../libs/Uploader.swf',
        //是否要分片处理大文件上传。
	     chunked: true,
	     // 如果要分片，分多大一片？ 默认大小为5M.
	     chunkSize: 5 * 1024 * 1024,
	     // 上传并发数。允许同时最大上传进程数[默认值：3]   即上传文件数
	     threads: 3,
        //文件接收服务端
	     server: baseUrl+'apiproject/audio/'+useraccount,

        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#picker',
        method:"POST",
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false,
        formData: {
            taskId: upload_prj,//上传文件对应的项目id
            guid: upload_prj//分片文件临时存放路径
        },
        headers: {
            "x_hztz_token": token
        }
    });
    // 当有文件被添加进队列的时候
    uploader.on('fileQueued', function (file) {
        var $list = $('#thelist');
        $list.append('<div id="' + file.id + '" class="item">' +
            '<h4 class="info">' + file.name + '</h4>' +
            '<p class="state">等待上传...</p>' +
            '</div>');
    });
    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function (file, percentage) {
        var $li = $('#' + file.id),
            $percent = $li.find('.progress .progress-bar');

        // 避免重复创建
        if (!$percent.length) {
            $percent = $('<div class="progress progress-striped active">' +
                '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                '</div>' +
                '</div>').appendTo($li).find('.progress-bar');
        }

        $li.find('p.state').text('上传中');
        // console.log(percentage);
        // progress.set(percentage);
        $percent.css('width', percentage * 100 + '%');
    });


    uploader.on('fileQueued', function (file) {
        uploader.md5File(file)

            // 及时显示进度
            .progress(function (percentage) {
                // console.log('Percentage:', percentage);
                progress.set(percentage);
            })

            // 完成
            .then(function (val) {
                // console.log('md5 result:', val);
            });

    });


    // 文件上传成功处理。
    uploader.on('uploadSuccess', function (file, response) {
        $('#' + file.id).find('p.state').text('已上传');

        //如果为校对项目
        if($('#rewritePro').find('input[type="checkbox"]').is(":checked")){
            $.ajax({
                url:baseUrl+'apiproject/audio/import/'+useraccount,
                type: "PUT",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "x_hztz_token": token
                },
                data: JSON.stringify({
                    "name": file.name,
                    "taskId": file.taskId,
                    "projectType":file.projectType
                }),
                success: function (res) {
                    // console.log(res);
                },
            });
            return;
        }

        $.ajax({
            url:baseUrl+'apiproject/audio/'+useraccount,
            type: "PUT",
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x_hztz_token": token
            },
            data: JSON.stringify({
                "name": file.name,
                "taskId": file.taskId,
                "projectType":file.projectType
                // "chuncks":file.chuncks,
                // "chunck":file.chunk
            }),
            success: function (res) {
                // console.log(res);
            },
        });
    });

    uploader.on('uploadError', function (file) {
        $('#' + file.id).find('p.state').text('上传出错');
    });

    uploader.on('uploadComplete', function (file) {
        //$('#' + file.id).find('.progress').fadeOut();
    });
    // 开始上传
    $('#uploadBtn').on('click', function (file) {
        uploader.upload();
    });
    var filename='';
    //上传之前
    uploader.on('uploadBeforeSend', function (block, data) {
        var file = block.file;
        filename=file.name;
        //设置上传文件附带的参数
        data.taskId = upload_prj;
        data.guid = upload_prj;
        if(projectType=='BIG_AUDIO'){
            data.projectType=Number(0);
        }else{
            data.projectType=Number(1);
        }
        data.start=block.start;
        data.end=block.end;

        file.taskId=data.taskId;
        file.projectType=data.projectType;

        // console.log(data);
    });


});