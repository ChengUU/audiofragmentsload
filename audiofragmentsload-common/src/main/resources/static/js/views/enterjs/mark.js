window.parent.baseUrl = "localhost:8080/audio-fragments-load/";
$(function () {
    /*自定义字符串格式化*/
    String.prototype.format = function (args) {
        /*this代表要调用Format方法的字符串*/
        /*replace的第一个参数为正则表达式，g表示处理匹配到的所有字符串，在js中使用//包起来*/
        /*replace的第二个参数为匹配字符串的处理，k1匹配结果包含{}，k2只保留{}内的内容*/
        var temp = this.replace(/\{(\w+)\}/g, function (k1, k2) {
            console.log(k1, k2);
            /*replace将匹配到的k2用参数args替换后赋给新变量temp*/
            return args[k2];
        });
        /*自定义方法Format将格式化后的字符串返回*/
        return temp;
    };
});
document.addEventListener('DOMContentLoaded', function () {
    var tempInterval=null;
    var tempIndex=0;
    var that = {
        waveContainerWidth: 0,
        wrapperWidth: 0,
        res: {},
        duration: 0,
        rangeBit: 0,
        audioInfo: {},
        blobPools: [],
        waveFormWidth: 0,
        segNumbers: 0,
        currentSeg: 1,
        waveFormLeft: 0,
        waveWrapper: null,
        wavesurfer:null,
        rangeSecond: 100,
        /**
         * 获取音频片段
         * @param segNumber 加载第几段
         * @param justCache 仅仅缓存 true 仅缓存不加载
         * @param initLoad 初始加载
         */
        getAudioSeg: function (segNumber, justCache, initLoad) {
            var that = this;
            var xhr = new XMLHttpRequest();
            var reqUrl = location.origin;
            xhr.open(
                "GET",
                "test/api/audio/1",
                true
            );
            xhr.responseType = "arraybuffer";

            var startBit = this.rangeBit * (segNumber - 1);
            var endBit = this.rangeBit * segNumber;
            var bytes="bytes={startBit}-{endBit}";
            xhr.setRequestHeader("Range", bytes.format({startBit:startBit,endBit:endBit}));

            xhr.onload = function () {
                console.log("load audio url successful");
                if (this.status === 200||this.status === 206 || this.status === 304) {
                    var type = xhr.getResponseHeader("Content-Type");
                    var blob = new Blob([this.response], {type: type});

                    // 转换成URL并保存
                    that.blobPools[segNumber] = {
                        url: URL.createObjectURL(blob)
                    };
                    console.log(that.blobPools);
                    // 第一次加载第一段，并对播放器事件进行绑定
                    if (initLoad) {
                        // 音频事件绑定
                        waveBindEvent();
                        console.log(that.blobPools[segNumber]);
                        that.wavesurfer.load(that.blobPools[segNumber].url);
                        that.currentSeg = 1;

                    } else if (!justCache) {
                        that.currentSeg = segNumber;
                        that.wavesurfer.load(that.blobPools[segNumber].url);
                    }

                    // 滚动条的位置随着加载的位置移动
                    if (!justCache && that.segNumbers > 1) {
                        that.setScrollPos(segNumber);
                    }
                }
            };

            xhr.onerror = function () {
                that.progress = false;
            };
            xhr.send();
        },
        /**
         * 根据段设置容器的位置，保证波纹在可见区域
         * @param segNumber 请求段
         */
        setScrollPos: function (segNumber) {
            var n = segNumber ? segNumber : this.currentSeg;
            var segNumbers = this.segNumbers;
            var end = this.blobPools[n - 1] && this.blobPools[n - 1].endPos;
            // 最后一段，这里是一个hack，为了防止误差
            if (n === segNumbers && this.blobPools[n] && this.blobPools[n].startPos) {
                end = this.blobPools[n].startPos;
            }

            this.waveFormScroll = end ? end : (n - 1) * this.wrapperWidth;
            this.waveFormLeft = this.waveFormScroll;
            this.waveWrapper.scrollLeft = this.waveFormScroll;
        },
        /**
         * 随机点击容器
         * @param e 点击的容器e
         */
        containerClick: function (e) {
            if (that.segNumbers == 1 || this.progress) {
                return;
            }
            // 点击的位置记录
            var layerX = e.layerX;

            // 记录当前鼠标点击的绝对位置
            var scrollLeft = that.waveWrapper.scrollLeft;
            this.clickWrapperPos = layerX - scrollLeft;

            // 获取点击的时间点
            var currentTime = parseInt(layerX / 20);

            // 获取字节所在
            var size = that.audioInfo.size;
            var duration = that.audioInfo.duration;
            var bitrate = that.audioInfo.sampleRate * that.audioInfo.frameSize * 8 / 1000;
            var currentBit = (bitrate * currentTime) / 8;
            var seg = Math.ceil(currentBit / this.rangeBit);

            // 因为音乐的动态性，所以请求的段数会存在误差，这个时候更改请求的段数
            if (seg ==that.currentSeg) {
                // let currentMinTime = 60 * (this.currentSeg-1);
                // let currentMaxTime = 60 * this.currentSeg;
                var average = (120 * that.currentSeg - that.rangeSecond) / 2;
                seg = currentTime > average ? seg + 1 : seg - 1;
            }
            this.currentTime = currentTime;

            // 有缓存数据
            this.progress = true;
            if (that.blobPools[seg]) {
                // 加载缓存数据
                that.wavesurfer.load(that.blobPools[seg].url);

                // 更改当前的播放段数
                that.currentSeg = seg;
                that.setScrollPos();
            } else {
                that.getAudioSeg(seg);
            }
            // 记录这是点击请求的波纹，在波纹的ready方法中做处理
            that.fromSeek = true;
        }
    };

    addAudiosNum(null);

    $("wave-container").on("click",that.containerClick);

    /**
     * 加载音频列表
     * @param {Array} urlarray 音频列表数组
     */
    function addAudiosNum(urlarray) {
        //获取第一条音频数据
        $.ajax({
            url: 'test/audioinfo/' + 1,
            type: "GET",
            headers: {
                "Content-type": "application/json; charset=utf-8"
            },
            success: function (res) {
                // 初始化参数
                that.audioInfo = res;
                console.log(res);
                var data={
                    duration: parseFloat(res.duration),
                    sampleRate: parseInt(res.sampleRate),
                    frameSize: parseInt(res.frameSize),
                    size: parseInt(res.size),
                    channels: parseInt(res.channels)
                };
                // 音频时长
                that.duration = data.duration;
                // 音频宽：防止音频过短，渲染不完
                var dWidth = Math.round(data.duration * 20);
                that.waveContainerWidth = that.wrapperWidth > dWidth ? that.wrapperWidth : dWidth;

                console.log(data);
                that.bitrate=data.frameSize*data.sampleRate*8/1000;

                // 如果音频的长度大于500s分段请求,每段100s
                // 1分钟的字节数[平均] = 比特率(bps) * 时长(s)  /  8
                that.rangeBit =   that.duration > 500 ?data.frameSize*data.sampleRate*that.rangeSecond: data.size;

                // 总段数
                that.segNumbers = Math.ceil(data.size / that.rangeBit);

                console.log(that.rangeBit);
                console.log(that.segNumbers);

                /**
                 * 加载音频
                 */
                that.getAudioSeg(1,true,true);
            },
            error: function () {
                alert("连接失败");
            }
        });

    }


    /**
     * 停止音频播放
     */
    function pauseAudio() {
        that.wavesurfer.pause();
    }

    var regionTimer = null;

    /**
     * 定时器阻断播放播放
     * @param start
     * @param end
     */
    function playRange(start, end) {
        isClick = false;
        if (regionTimer != null) {
            window.clearTimeout(regionTimer);
        }
        var timeout = Number(parseFloat(end - start).toFixed(3) * 1000);
        regionTimer = setTimeout(pauseAudio, timeout);
        that.wavesurfer.play(start, end);
    }

    document.onkeydown = function (event) {//绑定按键触发时间
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
            case 113:
                if (nowplayRegion == null)
                    return;
                // nowplayRegion.play();
                var start = nowplayRegion.start;
                // // var end=(nowplayRegion.end).toFixed(1);
                // var end=nowplayRegion.end-keytime;
                var end = nowplayRegion.end;
                // wavesurfer.play(start,end);
                playRange(start, end);
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


// 开始-暂停音频
    $('#waveStart').on('click', function () {
        that.wavesurfer.playPause();
    });
//通过按钮播放选区
    $('#mark-text-list').on('click', '.play-mark', function () {
        var regionId = $(this).parents('li').attr("region-id");//获取到绑定的region的id
        var reg = that.wavesurfer.regions.list;//获取到region对象
        nowplayRegion = reg[regionId];

        var start = nowplayRegion.start;

        var end = nowplayRegion.end;
        playRange(start, end);

        //获取当前播放的region对象
        var $region = $('region[data-id=' + regionId + ']');
        $region.addClass('region-active').siblings().removeClass('region-active').end();
    });

    var $notes = "";
    var $role = "";

    $('#special').on('click', function () {
        alert("test");
        that.wavesurfer.addRegion({//创建region
            id: "sadadafaf",
            start: 1,
            end: 3,
            color: 'hsla(400, 100%, 30%, 0.5)',
            dragSelection: {//是否能用鼠标滑动选择区域
                slop: 5//占时不知道效果在哪里
            },
            // color:"rgba(0,0,0,0.5)",
            drag: true,//是否允许拖动区域
            resize: true,//是否允许调整区域
            loop: false,//循环播放此区域 bug手动都跳不出来
        })
    });

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

    /**
     * 计算两个日期(Date)对象的时间间隔
     * @param {开始的日期} startDate
     * @param {结束的日期} endDate
     * @param {返回值类型 1.天 2.时 3.分 4.秒} type
     */
    function dateInterval(startDate, endDate, type) {
        var temp = (endDate.getTime() - startDate.getTime()) / 1000;//日期差(秒)
        switch (type) {
            case 1:
                return (temp / (3600 * 24));
                break;
            case 2:
                return (temp / 3600);
                break;
            case 3:
                return (temp / 60);
                break;
            case 4:
                return temp;
                break;
            default:
                return -1;
                break;
        }
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

//小音频片段
    var cutAudioVOS = null;

    /**
     * 创建wavesurfer对象
     */
    function createWavesurfer() {
        return WaveSurfer.create({
            // Use the id or class-name of the element you created, as a selector
            container: '#waveform',
            // The color can be either a simple CSS color or a Canvas gradient
            progressColor: 'rgba(255, 0, 0, 0.3)',
            cursorColor: 'black',
            waveColor: '#A8DBA8',
            backend: 'MediaElement',
            audioContext: "demo",
            // mormalize: true,
            responsive: 100,
            minPxPerSec: 150,
            height: 256,
            plugins: [
                WaveSurfer.regions.create({
                    regions: [],
                    dragSelection: {//是否能用鼠标滑动选择区域
                        slop: 5//占时不知道效果在哪里
                    },
                    color: "rgba(59, 180, 242, 0.3)",
                    drag: false,//是否允许拖动区域
                    resize: true,//是否允许调整区域
                    loop: false//循环播放此区域 bug手动都跳不出来
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
                    zoomDebounce: false
                })
            ]
        });
    }

    /**
     * 为wavesurfer绑定必要的事件
     * @param {wavesurfer} that.wavesurfer
     */

    function waveBindEvent() {
        if (that.wavesurfer != null) {
            that.wavesurfer.destroy();
            console.log(that.wavesurfer);
        }
        that.wavesurfer = null;
        that.wavesurfer = createWavesurfer();

        //进度条
        that.wavesurfer.on('loading', function (res) {
            if (tempInterval) {
                clearInterval(tempInterval);
                tempInterval = null;
            }
            resetTips('音频加载中');
            // console.log(res);
            resetTips('音频加载:' + res + '%');

            // $('#load-rate').html('音频加载:'+res+'%');
            if (res == 100) {
                // resetTips('波形绘制中');
                tempInterval = setInterval(function () {
                    tempIndex = (tempIndex + 1) % 5;
                    var str = "";
                    for (var i = 0; i <= tempIndex; i++) {
                        str += ".";
                    }
                    resetTips('波形绘制中' + str);
                }, 400);
            }
        });

        that.wavesurfer.on("audioprocess ", function () {
            // 表示的是前面实际播放的
            var leftTime = that.waveFormScroll
                ? parseFloat(that.waveFormScroll) / 20
                : 0;

            // 当前实际的时间
            that.currentTime = parseInt(res + leftTime);

            // wave移动的距离
            var moveDis = Math.round(res * 20);

            // 滚动条的实际位置
            var scrollLeft = that.$refs.waveWrapper.scrollLeft;
            var waveFormLeft = that.waveFormLeft;
            var waveFormWidth = that.waveFormWidth; //wave
            var wrapperWidth = that.wrapperWidth;

            // 第一段的时候 moveDis - scrollLeft;
            // 第二段 waveFormLeft-scrollLeft+moveDis
            var actualDis;
            if (waveFormLeft == 0) {
                actualDis = moveDis - scrollLeft;
            } else {
                actualDis = waveFormLeft - scrollLeft + moveDis;
            }

            // 大于位置
            if (actualDis === wrapperWidth) {
                var dis =
                    moveDis >= wrapperWidth
                        ? waveFormWidth - moveDis
                        : wrapperWidth - moveDis;
                that.waveWrapper.scrollLeft = scrollLeft + dis;
            }
        });

        that.wavesurfer.on('ready', function () {
            // 记录当断的位置
            var pools = that.blobPools;
            var currentSeg=that.currentSeg;
            // 第一段
            if (currentSeg == 1) {
                pools[currentSeg].startPos = 0;
                pools[currentSeg].endPos = that.waveFormWidth;
                // 预加载第二段
                if (that.segNumbers > 1) {
                    that.getAudioSeg(2, true);
                }
            } else if (currentSeg == that.segNumbers) {
                // 最后一段
                pools[currentSeg].startPos =
                    that.waveContainerWidth - that.waveFormWidth;
                pools[currentSeg].endPos = that.waveContainerWidth;
                console.log(pools);
                that.setScrollPos();
            } else {
                // 其他段
                that.getAudioSeg(currentSeg + 1, true);
                if (pools[currentSeg - 1] && pools[currentSeg - 1].endPos) {
                    pools[currentSeg].startPos = pools[currentSeg - 1].endPos;
                    pools[currentSeg].endPos =
                        pools[currentSeg].startPos + that.waveFormWidth;
                }
            }
        });

        that.wavesurfer.on('waveform-ready', function () {
            // console.log("success2");
            clearInterval(tempInterval);
            tempInterval = null;
            resetTips('波形绘制完成');
        });

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
});


