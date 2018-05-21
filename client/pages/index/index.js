//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        logged: false,
        takeSession: false,
        isAgent: false,
        isAdmin: false,
        requestResult: '',
        cartDisplay: 'none',
        setAddress: 'block',
        orderLines: [],
        total: {
          amount: 0,
          quantity: 0
        }
    },

    onLoad: function (options) {
      wx.setStorageSync('parentOpenId', options.parentOpenId)
      this.setData({
        parentOpenId: options.parentOpenId || 'ov1YY40SEid3RjaUIf5HFSHct-x4'
      })
      this.login()
    },

    checkAgent: function () {
      var that = this
      wx.setStorage({
        key: 'userInfo',
        data: that.data.userInfo
      })
      var openId = that.data.userInfo.openId
      wx.request({
        url: config.service.getAgent,
        method: 'GET',
        data: {openId: openId},
        success: function (res) {
          console.log(res)
          var agent = res.data.data
          if (!agent.length) return
          wx.setStorageSync('agent', agent[0])
          // if (agent[0].open_id.indexOf('ov1YY40SEid3RjaUIf5HFSHct-x4') >=0) {
          //   that.setData({isAdmin: true})
          // } else {
            that.setData({isAgent: true})
          // }
          setTimeout(function(){
            console.log(that.data.isAdmin, that.data.isAgent)
          },5000)
        }
      })
    },

    /**
   * 用户点击右上角分享
   */
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '自定义转发标题',
        path: '/pages/index/index?parentOpenId='+this.data.userInfo.openId,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    },

    getProducts: function () {
      var that = this;
      wx.request({
        url: config.service.productsUrl,
        method: 'GET',
        data: {
          agentOpenId: that.data.parentOpenId
        },
        success: function (res) {
          var products = []
          var goods = []
          res.data.data.forEach(function (e) {
            products.push({
              description: e.description,
              id: e.id,
              image: e.image,
              name: e.fruit_name,
              unitPrice: e.unit_price,
              agentPrice: e.agent_price
            })
            goods.push({
              pid: e.id,
              unitPrice: e.agent_price || e.unit_price,
              quantity: 0
            })
          })
          that.setData({
            products: products,
            goods: goods
          })
        },
        fail: function (res) {

        }
      })
    },

    onReady: function () {
      this.getProducts()
    },

    operateProd: function (e) {
      var d = e.target.dataset.id.split('-')
      var goods = this.data.goods
      var index = d[0]
      var good = goods[index]
      var quantity = good.quantity
      var total = this.data.total
      if (d[1] == 'plus') {
        quantity++
        total.amount += goods[index].unitPrice
        total.quantity += 1
      }
      if (d[1] == 'minus' && quantity > 0) {
        quantity--
        total.amount -= goods[index].unitPrice
        total.quantity -= 1
      }
      good.quantity = quantity
      goods[index] = good
      var products = this.data.products
      var p = products[index]
      var orderLine = {
        pid: p.id,
        quantity: quantity,
        price: p.agentPrice || p.unitPrice,
        name: p.name
      }
      var orderLines = this.data.orderLines
      var newLine = true
      for(var i = 0, l = orderLines.length; i < l; i++) {
        var o = orderLines[i];
        if (o.pid == p.id) {
          if (quantity == 0) {
            orderLines.splice(i, 1)
            break
          }
          o.quantity = quantity
          newLine = false
        }
      }
      if (newLine) {
        orderLines.unshift(orderLine)
      }
      this.setData({goods:goods, total: total, orderLines: orderLines})
    },

    closeCart: function () {
      this.setData({ cartDisplay: 'none'})
    },

    operateCart: function (e) {
      var goods = this.data.goods
      var orderLines = this.data.orderLines
      var domIds = e.target.dataset.id.split('-')
      var pid = domId[0]
      var quantity
      for (var i = 0, l = orderLines.length; i < l; i++) {
        if (orderLines[i].pid == pid) {
          if (domId[1] == 'minus') {
            if (orderLines[i].quantity == 1) {
              orderLines.splice(i,1)
              break
            }
            orderLines[i].quantity -= 1
          } else {
            orderLines[i].quantity += 1
          }
        }
      }
      for (var j = 0, len = goods.length; j < len; j++) {
        if (goods[i].pid == pid) {
          if (domId[1] == 'plus') {
            goods[i].quantity += 1
          } else if (goods[i].quantity > 0) {
            goods[i].quantity -= 1
          }
        }
      }
    },

    showCart: function () {
      this.setData({cartDisplay: 'block'})
    },

    addAddress: function () {
      var that = this
      wx.chooseAddress({
        success: function (e) {
          that.setData({ setAddress: 'none', address: e}, function () {
            console.log(that.data)
          })
        }
      })
    },

    createOrder: function () {
      var that = this
      var orderLines = that.data.orderLines
      var address = that.data.address
      var order = {
        orderLines: orderLines,
        agentOpenId: that.data.parentOpenId,
        buyerOpenId: that.data.userInfo.openId,
        buyerName: address.userName,
        buyerPhone: address.telNumber,
        province: address.provinceName,
        city: address.cityName,
        county: address.countyName,
        detailInfo: address.detailInfo,
        postalCode: address.postalCode
      }
      wx.request({
        url: config.service.ordersUrl,
        method: 'POST',
        data: order,
        success: function (res) {
          var goods = that.data.goods;
          goods.forEach(function (e) {
            e.quantity = 0
          })
          that.setData({ orderLines: [], cartDisplay: 'none', total: { quantity: 0, amount: 0 }, goods: goods, setAddress: 'block' })
        },
        fail: function (res) {
          wx.showToast({
            title: '下单失败',
            icon: 'fail'
          })
        },
        complete: function (res) {
          console.log(res)
        }
      })
    },

    // 用户登录示例
    login: function() {
        if (this.data.logged) {
          this.checkAgent()
          return
        }

        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('登录成功')
                    that.setData({
                        userInfo: result,
                        logged: true
                    }, function () {
                      that.checkAgent()
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            that.setData({
                                userInfo: result.data.data,
                                logged: true
                            }, function () {
                              that.checkAgent()
                            })
                        },

                        fail(error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },

    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    openProduct: function () {
      this.getProducts()
    },

    backStage: function () {
      wx.showLoading({
        title: '数据加载中...',
      })
      if (!this.data.isAgent && !this.data.isAdmin) return
      var url = this.data.isAgent ? '/pages/agentStage/agentStage' : (this.data.isAdmin && '/pages/backStage/backStage')
      wx.navigateTo({
        url: url,
      })
    },

    applyAgent: function () {
      // wx.navigateTo({
      //   url: '/pages/agentStage/agentStage'
      // })
      // return;
      wx.navigateTo({
        url: '/pages/applyAgent/applyAgent',
      })
    }
   
})
