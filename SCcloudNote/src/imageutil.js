function imageUtil(w,h,b) {
  var originalWidth = w;//图片原始宽 
  var originalHeight = h;//图片原始高 

  //获取图片的原始长宽
  var windowWidth = 0, windowHeight = 0;
  var autoWidth = 0, autoHeight = 0;
  var results = {};
  wx.getSystemInfo({
    success: function (res) {
      windowWidth = res.windowWidth;
      windowHeight = res.windowHeight;
      //判断按照那种方式进行缩放
      if (originalWidth > windowWidth) {//在图片width大于手机屏幕width时候
        autoWidth = windowWidth;
        autoHeight = (autoWidth * originalHeight) / originalWidth;
        results.imageWidth = autoWidth*b;
        results.imageHeight = autoHeight*b;
      } else {//否则展示原来的数据
        results.imageWidth = originalWidth*b;
        results.imageHeight = originalHeight*b;
      }
    }
  })
  return results;
}
module.exports = {
  imageUtil: imageUtil
} 
