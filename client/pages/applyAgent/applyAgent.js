// pages/applyAgent.js
var config = require('../../config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  applyAgent: function (e) {
    var that = this
    var userInfo = wx.getStorageSync('userInfo')
    var parentOpenId = wx.getStorageSync('parentOpenId')
    var detail = e.detail.value
    if (!detail.agentName) {
      wx.showToast({
        title: '请输入您的姓名',
        icon:'none'
      })
      return
    }
    if (!detail.agentPhone) {
      wx.showToast({
        title: '请输入您的联系方式',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '正在发送申请数据...'
    })
    wx.request({
      url: config.service.applyAgentUrl,
      method: 'POST',
      data: {
        openId: userInfo.openId,
        parentOpenId: parentOpenId,
        nickName: userInfo.nickName,
        province: userInfo.province,
        city: userInfo.city,
        agentName: detail.agentName,
        agentPhone: detail.agentPhone,
        senderName: detail.senderName,
        senderPhone: detail.senderPhone
      },
      success: function (res) {
        wx.showToast({
          title: '恭喜您，申请成功！',
          duration: 2000
        })
        wx.redirectTo({
          url: '/pages/agentStage/agentStage'
        })
      },
      fail:function (res) {
        wx.showToast({
          title: '申请失败',
          icon: 'none'
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  }

  
})