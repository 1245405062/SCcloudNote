// page/showimg/showimg.js
var imageUtil = require('../../src/imageutil.js')

Page({
  data:{
    imagewidth:0,
    imageheight:0,
    src:''
  },
  onLoad:function(options){
    this.setData({
      'src':options.src
    })
  },
  ImageLoad:function(e){
    var width=e.detail.width;
    var height=e.detail.height;
    var imagesize=imageUtil.imageUtil(width,height,1);
    this.setData({
      'imagewidth':imagesize.imageWidth,
      'imageheight':imagesize.imageHeight,
    })
  }
})