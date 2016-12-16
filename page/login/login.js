const AV = require('../../src/av-weapp.js')
let app = getApp();

Page({
  
  name: "login",
  data: {
    ifLogup:true,
    ifphone:false,
    email:"",
    name:"",
    password:"",
    passwordSure:'',
    phoneNum:'',
    num:'',
    warn:{
      warn_email:'',
      warn_name:'',
      warn_passwordSure:'',
    },
    getback:"< 返回",
    verifyEmailOrForgetPassword:'忘记密码？找回',
  },

 
  onLoad () {
    new app.WeToast();
  },

  turnTologin:function(e){
    //转为登录
    this.setData({
      ifLogup:false
    });
    this.data.email='';
    this.data.name='';
    this.data.password='';
    this.data.passwordSure='';
   },
  turnTologup:function(e){
    this.setData({
      ifphone:false,
      ifLogup:true,
      num:'',
    });
    this.data.name='';
    this.data.email='';
    this.data.phoneNum='';
    this.data.password='';
   },
  turnto_phone:function(e){
    this.setData({
      ifphone:true,
    })
   },

tap_logup(e){
    if(this.data.email==""){
      this.wetoast.toast({
        img:'../../images/remind.png',        
        title:"请输入您的邮箱",
        duration:1200,
        titleClassName:'my_toast_title'
      });
      //this.data.placeholder.
    }else if(this.data.email.slice(-4)!=".com"||this.data.email.indexOf('@')<0){
       this.wetoast.toast({
        img:'../../images/remind.png',        
        title:"您输入的邮箱不合法",
        duration:1200,
        titleClassName:'my_toast_title'
      });
      this.setData({
        warn:{
          warn_email:"color:rgb(241,1,25);",},
      });
    }else if(this.data.password==""){
      this.wetoast.toast({
        img:'../../images/remind.png',        
        title:"请设置登陆密码",
        duration:1200,
        titleClassName:'my_toast_title'
      })
    }else if(this.data.password==this.data.passwordSure){
      //将inform上传至数据库
      var user = new AV.User();
      var that =this;
      user.setUsername(this.data.name);
      user.setEmail(this.data.email);
      user.setPassword(this.data.password);
      user.signUp().then(function(loginedUser){
        app.iflogup=true;
        wx.showToast({
          title:'',
          icon:'loading'
        });
        wx.redirectTo({
          url: '../main/main?usrid='+loginedUser.id
        })
      },function(error){
        switch(error.code){
          case 203:
            that.wetoast.toast({
              img:'../../images/wow.png', 
              title:"您已注册过，请登录",  
              titleClassName:'my_toast_title',  
            });
            that.turnTologin();
            break;
          case 202:
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"此用户名已被注册",    
              titleClassName:'my_toast_title',  
            });
            that.setData({
              warn:{
              warn_name:"color:rgb(241,1,25);",
              },
            });
            break;
          case 214:
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"您的手机已注册过请登录",  
              titleClassName:'my_toast_title',                  
            });
            break;
        };
      });
    }else{
     this.wetoast.toast({
        img:'../../images/remind.png', 
        title:"两次输入的密码不一致",
        duration:1200,
        titleClassName:'my_toast_title'
      });
      this.setData({
        warn:{
          warn_passwordSure:"color:rgb(241,1,25);",
          },
      });
    }
   },
tap_login:function(){
    var user_login = new AV.User(); 
    var that=this; 
    if(this.data.name==''){
      this.wetoast.toast({
        img:'../../images/remind.png', 
        title:"请输入注册邮箱",
        duration:1500,
        titleClassName:'my_toast_title'
      });  
    }else if(this.data.password==''){
      this.wetoast.toast({
        img:'../../images/remind.png', 
        title:"请输入密码",
        duration:1500,
        titleClassName:'my_toast_title'
      }) 
    }
   /*邮箱+密码登陆不行 leancloud没有提供这个接口
    else if(this.data.num.indexOf(".com",0)>0){
      //user_login.setEmail(this.data.num);
      user_login.set("email",this.data.num);
      user_login.setPassword(this.data.password);
      user_login.logIn().then(
        function(loginedUser){
          console.log("success_mail");console.log(loginedUser);
          var getname=loginedUser.getUseName();
          console.log(getname);
          var getemail=loginedUser.getEmail();
          console.log(getemail);
        },
        function(error){
          console.log(error);
          if(error.code=='205'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"查无此用户",
              duration:1500,
              titleClassName:'my_toast_title'
            });
          }else if(error.code=='216'){
            AV.User.requestEmailVerfiy('abc@xyz.com').then(
              function (result) {
                console.log(JSON.stringify(result));
                }, 
                function (error) {
                  console.log(JSON.stringify(error));
            });
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"请先验证邮箱",
              duration:1500,
              titleClassName:'my_toast_title'
            });
          }else if(error.code=='210'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"密码错误",
              duration:1500,
              titleClassName:'my_toast_title'
            });
            that.setData({
              warn:{
                warn_passwordSure:"color:rgb(241,1,25);",
              },
            });
          };
        })
    }
  */
    else{
      user_login.setUsername(this.data.name);      
      user_login.setPassword(this.data.password);
      user_login.logIn().then(
        function(loginedUser){
          wx.showToast({
          title:'',
          icon:'loading'
        });
          var userid = loginedUser.id;
           //匹配成功后跳转界面
          wx.redirectTo({
            url: '../main/main?usrid='+userid,
          })
        },
        function(error){
          console.log('error.code');console.log(error.code);
          if(error.code=='210'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"密码错误",
              duration:1500,
              titleClassName:'my_toast_title'
            });
            that.setData({
              warn:{
                warn_passwordSure:"color:rgb(241,1,25);",
              },
            });
          }else if(error.code=='211'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"该邮箱还未注册，请先注册",
              duration:2200,
              titleClassName:'my_toast_title'
            });
            that.setData({
              warn:{
                warn_name:"color:rgb(241,1,25);",
              },
              ifLogup:true,
              })
          }else if(error.code=='216'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"请先验证邮箱",
              duration:2000,
              titleClassName:'my_toast_title'
            });
            //往邮箱中发送验证邮件
            AV.User.requestEmailVerify(that.data.email).then(
              function (result) {
                }, 
              function (error) {
                if(error.code=='1'){
                  that.wetoast.toast({
                    img:'../../images/remind.png',        
                    title:"今日往此邮箱发送的邮件数已超上限",
                    duration:2000,
                    titleClassName:'my_toast_title'
                  });
                }
              });
            }else if(error.code=='219'){
                that.setData({
                  warn:{
                    warn_passwordSure:"color:rgb(241,1,25);",
                  },
                });
                  that.wetoast.toast({
                    img:'../../images/remind.png',        
                    title:"登录失败次数超过限制，请稍候再试，或通过忘记密码重设密码",
                    duration:4000,
                    titleClassName:'my_toast_title'
                  });
                }
        })
    }
   },
  getnum:function(e){
    var that = this;
    if(parseInt(that.data.phoneNum).toString().length==11){
    /*用验证码登录
      AV.User.requestLoginSmsCode(that.data.phoneNUum).then(
        function(success){
          console.log('already send');
        },
        function(error){

        }
      )
    */
      //signupp or login时的请求验证码发送
      AV.Cloud.requestSmsCode(that.data.phoneNum).then(
      function(success){
        wx.showToast({
          title:'验证码已发送',
          icon:'success',
        });
      },
      function(errocr){
      });   
    }else{  
      this.wetoast.toast({
        img:'../../images/remind.png', 
        title:"请输入正确的手机号",
        titleClassName:"my_toast_title"
      })
    }
   },
  inputNum:function(e){
    this.data.num=e.detail.value;
   },
  //短信验证码验证
  quick_login_phone:function(e){
    var that  =this;
    if(parseInt(this.data.num).toString().length==6){
    /*//短信验证码登录
      AV.User.logInWithMobilePhoneSmsCode(that.data.phoneNum,that.data,num).then(
        function(success){
          console.log('验证码登录成功');
          wx.redirectTo({
            url: '../main/mian',
          })
        }
      );
      */  
    /* 用户signup的方法
      var user = new AV.User();
      user.set("username",'18482227358'); 
      user.set("password",'123456');  
      user.setMobilePhoneNumber('18482227358');
      //user.set("smsCode","566758");不要这一行吧，会报错，说smssmsCodeode不能为空，但是加了这一行，smssmsCode不轮填什么都会注册成功
      user.signUp().then(
        function(loginedUser){
          console.log('注册成功');
          wx.redirectTo({
            url: '../main/main',
            
          })
        },
        function (error){
          if(error.code=='214'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"您已注册过，请登录",  
              titleClassName:'my_toast_title',  
            });
            that.turnTologin();
          }          
        });
        
       
          
      AV.User.logInWithMobilePhone('18482227358','123456').then(
         function(success){
           console.log(loginedUser);
         },
         function(error){
           Console.log(error);
         }
       )
    */
      AV.User.signUpOrlogInWithMobilePhone(this.data.phoneNum,this.data.num).then(
        function(loginedUser){
          wx.showToast({
          title:'',
          icon:'loading'
        });
          wx.redirectTo({
            url:  '../main/main?usrid='+loginedUser.id,
          })
        },
        function(error){
          console.log('error:');console.log(error.code);
          if(error.code=='603'){
            that.wetoast.toast({
              img:'../../images/remind.png', 
              title:"无效的验证码",
              duration:1500,
              titleClassName:'my_toast_title'
            })
          }
        }
      );
    }else{
      that.wetoast.toast({
        img:'../../images/remind.png', 
        title:"无效的验证码",
        duration:1500,
        titleClassName:'my_toast_title'
      })
    }
  },
/*第三方登录
 login_qq:function(e){
    AV.User.signUpOrlogInWithAuthData({
      // 微博（weibo）用 uid
      // 微信（weixin）和 QQ（qq）用 openid
      "openid": "oPrJ7uM5Y5oeypd0fyqQcKCaRv3o",
      "access_token": "OezXcEiiBSKSxW0eoylIeNFI3H7HsmxM7dUj1dGRl2dXJOeIIwD4RTW7Iy2IfJePh6jj7OIs1GwzG1zPn7XY_xYdFYvISeusn4zfU06NiA1_yhzhjc408edspwRpuFSqtYk0rrfJAcZgGBWGRp7wmA",
      "expires_at": "2016-01-06T11:43:11.904Z"
  }, 'weixin').then(function (s) {
  }, function (e) {

  });
 },
*/
getPassword:function(e){
    this.setData({
      password: e.detail.value,
      warn:{
        warn_passwordSure:'',
      }
    })
    this.data.password = e.detail.value;
 },
getEmail:function(e){
    this.data.email = e.detail.value;
    this.data.name = e.detail.value;
    this.setData({
        warn:{
          warn_email:"",},
      });
 },
passwordSure:function(e){
    if(e.detail.value===this.data.password) 
      this.data.passwordSure = e.detail.value;
      this.setData({
        warn:{
          warn_passwordSure:"",
          },
      });
  },
getPhoneNum:function(e){
    this.setData({
      phoneNum:e.detail.value,
    });
  },
input_num:function(e){
    this.data.num=e.detail.value;
  },
//重置密码";
forgetPassword:function(e){
  var that = this;
  AV.User.requestPasswordReset(this.data.email).then(
    function (success) {
      wx.showToast({
        title:'密码重置邮件已发送，请在邮件中重置密码',
        icon:'success',
        duration:5000,
    });}, 
    function (error) {
      console.log(error);console.log(error.code);
      if(error.code=='1'){
        that.wetoast.toast({
          img:'../../images/remind.png',        
          title:"今日往此邮箱发送的邮件数已超上限",
          duration:2000,
          titleClassName:'my_toast_title'
        });
      }else if(error.code=='204'){
        that.wetoast.toast({
          img:'../../images/remind.png',        
          title:"请先输入注册邮箱",
          duration:1200,
          titleClassName:'my_toast_title'
        });
      }else if(error.code=='205'){
        that.wetoast.toast({
          img:'../../images/remind.png',        
          title:"您还没注册哦",
          duration:1200,
          titleClassName:'my_toast_title'
        });
      }
    });
  },
})

