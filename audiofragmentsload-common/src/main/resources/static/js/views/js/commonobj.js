define([
    'require',
    'jquery'
], function(require, $) {
    $('.a-result').on('click',function(){
        $('.a-result').removeClass('active');
        $(this).addClass("active");
    })
    return commonobj={
        //页面回退
        goback:function () {
            window.parent.go(-1);
        },

        //输出测试文本
        test:function (str) {
            alert(str);
        }
        //接着写自定义函数
    }
});