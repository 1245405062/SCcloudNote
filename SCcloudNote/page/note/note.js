const AV = require('../../src/av-weapp.js')
let app=getApp();
var imageUtil = require('../../src/imageutil.js')
var longtap = false;
var noteid = ''
var usrid = ''
var folderid = '';
var isnew = false;
Page({
  data: {
    address: '我的笔记:/日记本/',
    editdata: {
      title: {
        text: '',
        imgsrc: ''
      },
      content: [{
        text: {
          textstyle: 'note-content-text',
          text: ''
        },
        img: {
          imgstyle: 'note-content-img-none',
          src: 'http://bpic.588ku.com/back_pic/04/07/63/28581203949ca9d.jpg!/fw/400/quality/90/unsharp/true/compress/true',
          id: ''
        }
      }]
    },
    imgs: [{
      imgwidth: 0,
      imgheight: 0,
    }],
    cameraalpha: 1,
    windowHeight: 0,
    noteData:'',
  },
  onLoad: function (options) {
    new app.WeToast();
    calWindowHeight(this);
    noteid = options.noteid;
    if (noteid != null) {
      download(this)
    } else {
      isnew = true
      usrid = options.usrid;
      folderid = options.folderid;
      noteDate=options.note_date
    }
  },
  /*
  onUnload:function(){
    // 页面关闭
    console.log(this.data.editdata.title.text);
    if(this.data.editdata.title.text!=''){
      if(noteid==null){
        upload(this.data.editdata);
      }else{
        upload(this.data.editdata,noteid);
      }
    }
  },
  */
  camera: function () {
    var that = this;
    var content = this.data.editdata.content;
    var imgs = this.data.imgs;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var src = res.tempFilePaths[0];
        addnewimg(that, src);
      }
    })
  },
  formBindsubmit: function (e) {
    var values = e.detail.value;
    if (values['title'] != null && values['title'] != '') {
      var editdata = this.data.editdata;
      /*从表单中获取文本*/
      editdata.title.text = values['title'];
      var i = 0;
      for (var textname in values) {
        if (textname != 'title') {
          editdata.content[i].text.text = values[textname]
          i++;
        }
      }
      /*判断是否是新文件*/
      if (isnew) {
        //新文件
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1000
        })
        upload(editdata)
        isnew = false;
        wx.navigateBack({
                delta: 1, // 回退前 delta(默认为1) 页面
        })
      } else {
        //旧文件
        wx.showModal({
          title: '保存文档',
          content: '确定要更新文档吗?',
          success: function (res) {
            if (res.confirm) {
              update(editdata, noteid)
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
              });
              wx.navigateBack({
                delta: 1, // 回退前 delta(默认为1) 页面
              })
            } else {
              wx.showToast({
                title: '操作取消',
                icon: 'success',
                duration: 1000
              })
            }
          }
        })
      }
    } else {
      this.wetoast.toast({
        title: '标题不可为空',
        img:'../../images/remind.png',        
        duration:2000,
        titleClassName:'my_toast_title'
      })
    }
  },
  imagetap: function (e) {
    if (!longtap) {
      var idstr = e.target.id.substring(0, 1)
      var id = parseInt(idstr);
      var img = this.data.editdata.content[id].img;
      if (img.imgstyle != 'note-content-img-none' & img.src != '') {
        wx.navigateTo({
          url: "../showimag/showimag?src=" + img.src
        })
      }
    }
  },
  imagelongtap: function (e) {
    var that = this;
    longtap = true;
    var idstr = e.target.id.substring(0, 1)
    var id = parseInt(idstr);
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张图片吗?',
      success: function (res) {
        if (res.confirm) {
          delImg(id, that);
        }
      },
      complete: function (res) {
        longtap = false;
      }
    })
  },
  cameratouchstart: function (e) {
    this.setData({
      'cameraalpha': 0.2
    })
  },
  cameratouchend: function (e) {
    this.setData({
      'cameraalpha': 1
    })
  }
})
function delImg(k, that) {
  var editdata = that.data.editdata;
  var imgs = that.data.imgs;
  var id = editdata.content[k].img.id;
  var file = AV.File.createWithoutData(id);
  file.destroy().then(function (success) {
    editdata.content[k].img.src = ' ';
    editdata.content[k].img.imgstyle = 'note-content-img-none'
    editdata.content[k].img.id = ' ';
    imgs[k].imgwidth = 0;
    imgs[k].imgheight = 0;
    that.setData({
      'editdata': editdata,
      'imgs': imgs
    })
  }, function (error) {
    toastError(error)
  });

}

function addnewimg(that, src) {
  var content = that.data.editdata.content;
  var imgs = that.data.imgs;
  var l = content.length;
  var file = new AV.File('file-name', {
    blob: {
      uri: src
    },
  }).save().then(function (file) {
    var imgsrc = file.url()
    var id = file.id;
    content[l - 1].img.imgstyle = 'note-content-img-display';
    content[l - 1].img.src = imgsrc
    content[l - 1].img.id = id
    calImg(imgsrc, that, l - 1, imgs);
    content[l] = {
      text: { textstyle: 'note-content-text', text: '       ' },
      img: { imgstyle: 'note-content-img-none', src: '', id: '' }
    }
    imgs[l] = { imgwidth: 0, imgheight: 0, }
    that.setData({
      'editdata.content': content,
    })
  }, function (error) {
    toastError(error)
  });
}
function download(that) {
  var query = new AV.Query('NoteDB');
  query.get(noteid).then(function (result) {
    var editdata = result.get('editdata')
    usrid = result.get('usrid')
    folderid = result.get('folderid')
    calAllImg(editdata.content, that)
    that.setData({
      'editdata': editdata,
    })
    getaddress(that);
  }, function (error) {
    toastError(error)
  });
}
function upload(editdata) {
  /*将editdata上传至数据库数据库*/
  var NoteDB = AV.Object.extend('NoteDB');
  var noteObj = new NoteDB();
  noteObj.set('editdata', editdata);
  noteObj.set('usrid', usrid)
  noteObj.set('folderid', folderid)
  noteObj.save().then(function (result) {
    noteid=result.id
  }, function (error) {
    toastError(error)
  })
}

function update(editdata, objid) {
  var noteObj = AV.Object.createWithoutData('NoteDB', objid);
  noteObj.set('editdata', editdata);
  console.log(editdata)
  noteObj.save(function (success) { }, function (error) {
    toastError(error)
  })
}

function calImg(src, that, k, imgs) {
  wx.getImageInfo({
    src: src,
    success: function (res) {
      var imagesize = imageUtil.imageUtil(res.width, res.height, 0.5);
      imgs[k] = { imgwidth: imagesize.imageWidth, imgheight: imagesize.imageHeight }
      that.setData({
        'imgs': imgs
      })
    },
    fail: function (e) {
      calImg(src, that, k, imgs)
    }
  })
}
function calAllImg(content, that) {
  var imgs = [{ imgwidth: 0, imgheight: 0, }]
  content.forEach(function (a, b, c) {
    var img = { imgwidth: 0, imgheight: 0, }
    imgs[b] = img;
  })
  that.setData({
    'imgs': imgs
  })
  content.forEach(function (a, b, c) {
    var imgs = that.data.imgs;
    var src = content[b].img.src;
    var srcstyle = content[b].img.imgstyle;
    if (srcstyle != 'note-content-img-none') {
      calImg(src, that, b, imgs)
    } else if (b == content.length - 1) {
      that.setData({
        'imgs': imgs
      })
    }
  })
}
function calWindowHeight(that) {
  wx.getSystemInfo({
    success: function (res) {
      var windowHeight = res.windowHeight;
      that.setData({
        'windowHeight': windowHeight - 152
      })
    }
  })
}
function toastError(error) {
  var fileerror = 'Forbidden to create by class permissions.'
  var noteerror = 'Forbidden to find by class permissions.'
  console.log(error.message)
  if ((fileerror == error.message) || (noteerror == error.message)) {
    wx.showToast({
      title: '请返回登录',
      icon: 'loading',
      duration: 1000
    })
  }
}
function getaddress(that) {
  var query = new AV.Query('NotebookDB');
  query.get(folderid).then(function (result) {
    var address = result.get('name')
    address = '我的笔记:/' + address + '/'
    that.setData({
      'address': address,
    })
  }, function (error) {
    toastError(error)
  });
  
}

