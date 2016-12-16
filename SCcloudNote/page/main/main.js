// page/one/index.js
const AV = require('../../src/av-weapp.js')
var usrid = ''
var folderid = ''
var chosennotebook = 0;
var longtap = false;

Page({
  data: {
    username: '',
    open: false,
    mark: 0,
    newmark: 0,
    rollmark: 0,
    translate: '',
    windowWidth: 0,
    address: '',
    notebook: [{
      folderid: '',
      name: '日记本',
      alpha: 1.0,
      bkcolor: '#ffffff',
    }],
    note: []
  },
  onShow: function () {
    loadnotebook(this)
  },
  onLoad(options) {
    usrid=options.usrid;
    var that = this;
    loadnotebook(this)
    getUsername(this)
    wx.getSystemInfo({
      success: function (res) {
        that.data.windowWidth = res.windowWidth;
      }
    });
  },
  tap_main: function (e) {
    if (this.data.open) {
      this.setData({
        open: false,
        translate: ''
      });
    } else {
      this.setData({
        open: true,
        translate: ''
      });
    }
   },
  tap_start: function (e) {
    // touchstart事件
    this.data.mark = this.data.newmark = e.touches[0].pageX;
   },
  tap_drag: function (e) {
    // touchmove事件
    this.data.rollmark = this.data.mark;
    this.data.newmark = e.touches[0].pageX;
    /*menu是打开状态*/
    if (this.data.open) {
      if (this.data.newmark < this.data.mark) {
        if (this.data.windowWidth * 0.75 > (this.data.mark - this.data.newmark)) {
          this.setData({
            translate: 'transform:translateX(' + (this.data.windowWidth * 0.75 + this.data.newmark - this.data.mark) + 'px)'
          })
        }
      }
    } else {   /*menu是关闭状态 */
      if (this.data.newmark > this.data.mark) {
        if ((this.data.newmark - this.data.mark) < this.data.windowWidth * 0.75) {
          this.setData({
            translate: 'transform: translateX(' + (this.data.newmark - this.data.mark) + 'px)',
          });

        }
      }
    }
    this.data.rollmark = this.data.newmark;
   },
  tap_end: function (e) {
    // touchend事件
    // console.log(e);    
    if ((this.data.newmark - this.data.mark) > this.data.windowWidth * 0.2) {
      this.setData({
        open: true,
        translate: '',
      })
    } else if ((this.data.mark - this.data.newmark) > this.data.windowWidth * 0.2) {
      this.setData({
        open: false,
        translate: '',
      })
    } else {
      this.setData({
        translate: ''
      })
    }
   },
  tap_out: function (e) {
    wx.showModal({
      title: "",
      content: "确定退出当前账号？",
      success: function (res) {
        if (res.confirm) {
          AV.User.logOut();
          wx.redirectTo({
            url: '../login/login',
            success: function (res) {
              // success
            },
          })
        }
      }
    })
   },
  newNote: function () {
    var note = this.data.note;
    wx.navigateTo({
      url: '../note/note?usrid=' + usrid + '&folderid=' + folderid ,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  notebook_press_end: function (e) {
    var that = this;
    var notebook = that.data.notebook
    var address = ''
    if (e.target.id != '') {
      notebook.forEach(function (a, b, c) {
        notebook[b].alpha = 1.0
        notebook[b].bkcolor = '#ffffff'
        if (e.target.id == notebook[b].folderid) {
          //改变透明度
          notebook[b].alpha = 0.8;
          notebook[b].bkcolor = '#fff6ec'
          address = notebook[b].name
          //加载右边界面
          folderid = notebook[b].folderid
          chosennotebook = b;
          loadnote(that, folderid)
        }
      })
      that.setData({
        'notebook': notebook,
        'address': address
      });
      that.tap_main();
    }
  },
  note_press_start: function (e) {

    var that = this;
    var note = that.data.note
    if (e.target.id != '') {
      note.forEach(function (a, b, c) {
        if (e.target.id == note[b].noteid) {
          //改变透明度
          note[b].alpha = 0.4;
          note[b].bkcolor='rgb(255,154,128)';
        }
      })
      that.setData({
        'note': note
      })
    }
  },
  note_press_end: function (e) {
    var that = this;
    var note = that.data.note
    if (e.target.id != '') {
      note.forEach(function (a, b, c) {
        if (e.target.id == note[b].noteid) {
          //改变透明度
          note[b].bkcolor='#fff6ec';
          note[b].alpha=1.0;
        }
      })
      that.setData({
        'note': note
      })
    }
  },
  note_tap: function (e) {
    if (!longtap) {
      var note = this.data.note;
      note.forEach(function (a, b, c) {
        if (note[b].noteid == e.target.id) {
          console.log('跳转页面');
          console.log(note[b]);
          wx.navigateTo({
            url: '../note/note?noteid=' + note[b].noteid + '&note_date=' + note[b].updatedAt,
            success: function (res) {
              // success
            }
          })
        }else{
          console.log('不等');
        }
      })
    }
  },
  note_long_tap: function (e) {
    var that=this;
    longtap = true
    var note = this.data.note;
    note.forEach(function (a, b, c) {
      if (note[b].noteid == e.target.id) {
        delNote(that,note[b].noteid);
      }
    })
  }
})
function loadnote(that, folderid) {
  var query = new AV.Query('NoteDB');
  var note = []
  query.equalTo('usrid', usrid)
  query.equalTo('folderid', folderid)
  query.ascending('updatedAt')
  query.find().then(function (result) {
    result.forEach(function (a, b, c) {
      var noteid = result[b].id;
      var editdata = result[b].get('editdata')
      var updatedAt = DateFormat(result[b].updatedAt)
      var content = StringFormat(editdata.content[0].text.text)
      note[b] = {
        noteid: noteid,
        title: editdata.title.text,
        updatedAt: updatedAt,
        content: content,
        alpha: 1.0,
        bkcolr:'',
      }
    })
    that.setData({
      'note': note
    })
  }, function (error) {
    toastError(error)
  });
}
function loadnotebook(that) {
  var query = new AV.Query('NotebookDB');
  var notebook = that.data.notebook;
  query.find().then(function (result) {
    result.forEach(function (a, b, c) {
      notebook[b] = {
        folderid: result[b].id,
        name: result[b].get('name'),
        alpha: 1.0,
        bkcolor: '#ffffff'
      }
    })
    notebook[chosennotebook].alpha = 0.8;
    notebook[chosennotebook].bkcolor = '#fff6ec'
    folderid = notebook[chosennotebook].folderid
    loadnote(that, folderid)
    that.setData({
      'notebook': notebook,
      'address': notebook[chosennotebook].name
    })
  }, function (error) {
    console.log(error.message)
    toastError(error)
  });
}
function DateFormat(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
}
function StringFormat(str) {
  var content = [''];
  var j = 0;
  var change = false;
  var count = 0;
  for (var i = 0; i < str.length; i++) {
    if (str[i] != ' '&&str[i]!='\n') {
      if (str.charCodeAt(i) > 255) {
        //中文
        count = count + 2;
      } else {
        count = count + 1;
      }
      if (j < 4) {
        content[j] = content[j] + str[i]
        if (count == 28) {
          j++;
          count = 0;
          content[j] = ''
        }
      }
    }
  }
  return content
}
function getUsername(that) {
  var query = new AV.Query('_User');
  query.get(usrid).then(function (res) {
    var username = res.get('username')
    that.setData({
      'username': username
    })
  })
}
function delNote(that,noteid) {
  var note = AV.Object.createWithoutData('NoteDB', noteid);
  wx.showModal({
    title: '删除笔记',
    content: '确定要删除文档吗?',
    success: function (res) {
      if (res.confirm) {
        var query = new AV.Query('NoteDB');
        query.get(noteid).then(function (res) {
          var editdata = res.get('editdata')
          delAllImage(editdata)
        })
        note.destroy().then(function (success) {
          // 删除成功
          wx.showToast({
            title: '笔记已删除',
            icon: 'success',
            duration: 1000
          })
          loadnotebook(that)
        }, function (error) {
          // 删除失败
          console.log(error.message)
        });
      } else {
        wx.showToast({
          title: '操作取消',
          icon: 'success',
          duration: 1000
        })
      }
    },complete:function(){
      longtap=false;
    }
  })
}
function delAllImage(editdata) {
  var content = editdata.content;
  content.forEach(function (a, b, c) {
    var imgid = content[b].img.id;
    var file = AV.File.createWithoutData(imgid);
    file.destroy().then(function (success) {

    }, function (error) {

    });

  })
}
