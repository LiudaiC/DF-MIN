// pages/agentStage/agentStage.js
var config = require('../../config')
var util = require('../../utils/util.js')
const date = new Date()
const year = date.getFullYear()
const month = util.formatNumber(date.getMonth() + 1)
const day = util.formatNumber(date.getDate())

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    showSummary: false,
    showTeam: false,
    startDate: year + '-' + month + '-' + '01',
    endDate: year + '-' + month + '-' + day,
    today: year + '-' + month + '-' + day,
    viewType: 1
  },

  getProducts: function () {
    wx.showLoading({
      title: '正在加载商品列表...'
    })
    var that = this;
    wx.request({
      url: config.service.productsUrl,
      method: 'GET',
      data: {
        agentOpenId: that.data.userInfo.openId
      },
      success: function (res) {
        var products = []
        var goods = []
        res.data.data.forEach(function (e) {
          products.push({
            description: e.description,
            id: e.id,
            name: e.fruit_name,
            agentPrice: e.agent_price,
            unitPrice: e.unit_price
          })
        })
        that.setData({
          products: products
        })
      },
      fail: function (res) {

      },
      complete: function () {
        wx.hideLoading()
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    })
  },
  
  updateProd: function (e) {
    var d = e.detail.value
    if (Math.abs(d.originPrice - d.agentPrice) > 10) {
      wx.showModal({
        title: '',
        content: '自定义价与代理价差额不得超过10元',
        showCancel: false
      })
      return
    }
    d.agentOpenId = this.data.userInfo.openId
    wx.showModal({
      content: '确定修改吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: config.service.agentUpdateProdUrl,
            method: 'POST',
            data: d,
            success: function (res) {
              console.log('update successfully', res)
            },
            fail: function (res) {
              console.log('update failed', res)
            }
          })
        }
      }
    })
  },

  changeTap: function (e) {
    var viewType = e.target.dataset.type
    this.setData({viewType: viewType})
    if (viewType == 1) {
      this.getAgent('正在加载个人数据...')
    } else {
      this.getProducts()
    }
  },

  bindDateChange: function (e) {
    var data
    if (e.target.id == 'startDate') {
      data = {
        startDate: e.detail.value
      }
    } else {
      data = {
        endDate: e.detail.value
      }
    }
    this.setData(data)
  },

  queryInfo: function () {
    var data = this.data
    if (data.startDate > data.endDate) {
      wx.showToast({
        title: '结束时间不能早于开始时间',
        icon: 'none'
      })
      return
    }
    this.getAgent('正在查询...')
  },

  getAgent: function (msg) {
    wx.showLoading({
      title: msg
    })
    var that = this
    var data = that.data
    wx.request({
      url: config.service.getAgentSummary,
      method: 'GET',
      data: {
        openId: data.userInfo.openId,
        startDate: data.startDate,
        endDate: data.endDate
      },
      success: function (res) {
        var page = res.data.data
        that.setData({ page: page })
      },
      fail: function (res) {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        })
      },
      complete: function (res) {
        wx.hideLoading()
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({userInfo: userInfo})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getAgent('正在加载个人数据...')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // wx.showNavigationBarLoading()
    // var that = this
    // var viewType = that.data.viewType
    // if (viewType == 1) {
    //   that.getAgent('正在加载个人数据...')
    // } else {
    //   that.getProducts()
    // }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  
  getSelfOrders: function () {
    var that = this
    var showSummary = that.data.showSummary
    that.setData({showSummary: !showSummary}, function (){
      if (showSummary) return
      wx.showLoading({
        title: '正在获取个人数据...'
      })
      wx.request({
        url: config.service.getSelfOrders,
        method: 'GET',
        data: {
          openId: that.data.userInfo.openId,
          startDate: that.data.startDate,
          endDate: that.data.endDate
        },
        success: function (res) {
          that.setData({selfList: res.data.data})
        },
        fail: function (res) {

        },
        complete: function (res) {
          wx.hideLoading()
        }
      })
    })
  },

  getTeamOrders: function () {
    var that = this
    var showTeam = that.data.showTeam
    that.setData({ showTeam: !showTeam }, function () {
      if (showTeam) return
      wx.showLoading({
        title: '正在获取团员数据...'
      })
      wx.request({
        url: config.service.getTeamOrders,
        method: 'GET',
        data: {
          openId: that.data.userInfo.openId
        },
        success: function (res) {
          console.log(res.data)
        },
        fail: function (res) {

        },
        complete: function (res) {
          wx.hideLoading()
        }
      })
    })
  }

})