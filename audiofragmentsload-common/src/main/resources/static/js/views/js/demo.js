define([
    'require',
    'jquery'
], function (require, $) {
    
    $(function () {
        autoLeftNav();
        $(window).resize(function () {
            autoLeftNav();
            console.log($(window).width())
        });
    })

    // 风格切换

    $('.tpl-skiner-toggle').on('click', function () {
        $('.tpl-skiner').toggleClass('active');
    })

    $('.tpl-skiner-content-bar').find('span').on('click', function () {
        $('body').attr('class', $(this).attr('data-color'))
        saveSelectColor.Color = $(this).attr('data-color');
        // 保存选择项
        storageSave(saveSelectColor);
    })




    // 侧边菜单开关
    function autoLeftNav() {
        $('.tpl-header-switch-button').on('click', function () {
            if ($('.left-sidebar').is('.active')) {
                if ($(window).width() > 1024) {
                    $('.tpl-content-wrapper').removeClass('active');
                }
                $('.left-sidebar').removeClass('active');
                $('.iframe-right').css({
                    'width': 'calc(100% - 240px)',
                    'margin': '60px 0px 0px 240px',
                    'height':'99vh'
                });
            } else {
                $('.left-sidebar').addClass('active');
                if ($(window).width() > 1024) {
                    $('.tpl-content-wrapper').addClass('active');
                }
                $('.iframe-right').removeClass('hide-leftsider');
                $('.iframe-right').css({
                    'width': '100%',
                    'margin': '60px 0px 0px 0px',
                    'height':'99vh'
                });
            }
        })

        if ($(window).width() < 1024) {
            $('.left-sidebar').addClass('active');
            $('.iframe-right').css({
                'width': '100%',
                'margin': '60px 0px 0px 0px',
                'height':'99vh'
            });
        } else {
            $('.left-sidebar').removeClass('active');
            
            $('.iframe-right').css({
                'width': 'calc(100% - 240px)',
                'margin': '60px 0px 0px 240px',
                'height':'99vh'
            });
        }
    }


    // 侧边菜单
    $('.sidebar-nav-sub-title').on('click', function () {
        $(this).siblings('.sidebar-nav-sub').slideToggle(80)
            .end()
            .find('.sidebar-nav-sub-ico').toggleClass('sidebar-nav-sub-ico-rotate')
            .end()
            .find('.am-icon-angle-right').toggleClass('sidebar-nav-sub-ico-rotate90');
    })
});


