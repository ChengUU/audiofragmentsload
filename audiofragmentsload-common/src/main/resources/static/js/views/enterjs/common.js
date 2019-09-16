//文本输入区面板激活状态切换
$('#mark-text-list').on('click', 'li', function () {
    $(this).addClass('active').siblings().removeClass('active').end();
    //改变序号激活状态
    var xh=$('li.order-num[region-id="'+$(this).attr('region-id')+'"]');
    $('li.order-num').removeClass('active');
    xh.addClass('active');
});

//句子列表区域序号激活状态切换
$('#mark-order-list').on('click', 'li', function () {
    $(this).addClass('active').siblings().removeClass('active').end();
    //改变面板激活状态
    var mb=$('li.mark-text-panel[region-id="'+$(this).attr('region-id')+'"]');
    // console.log(mb);
    $('li.mark-text-panel').removeClass('active');
    mb.addClass('active');
});