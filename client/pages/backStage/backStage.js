// pages/backStage/backStage.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')


Page({

  /**
   * 页面的初始数据
   */
  MANAGE_TYPE: {
    PRODUCT: 1,
    AGENT: 2,
    RATE:3
  },

  data: {
    manageType: 1,
    addAgent: 'none',
    addProduct: 'none'
  },

  cancelAddAgent: function () {
    this.setData({addAgent:'none'})
  },

  showAgentFrom: function () {
    this.setData({addAgent: 'block'})
  },

  getProducts: function () {
    var that = this;
    wx.request({
      url: config.service.productsUrl,
      method: 'GET',
      success: function (res) {
        var products = []
        var goods = []
        res.data.data.forEach(function (e) {
          products.push({
            description: e.description,
            id: e.id,
            image: e.image,
            name: e.fruit_name,
            unitPrice: e.unit_price
          })
          goods.push({
            quantity: 0
          })
        })
        that.setData({
          products: products,
          goods: goods
        })
      },
      fail: function (res) {

      },
      complete: function () {
        that.setData({ manageType: 1 })
        wx.hideLoading()
      }
    })
  },

  getAgents: function () {
    var that = this
    wx.showLoading({
      title: '数据加载中...'
    })
    wx.request({
      url: config.service.agentsUrl,
      method: 'GET',
      success: function (res) {
          that.setData({agents:res.data.data})
      },
      fail: function (res) {

      },
      complete: function (res) {
        that.setData({ manageType: 2, products: []})
        wx.hideLoading()
      }
    })
  },

  getRates: function () {
    var that = this
    wx.showLoading({
      title: '数据加载中...'
    })
    wx.request({
      url: config.service.ratesUrl,
      method: 'GET',
      success: function (res) {
        var resData = res.data.data
        var rates = resData.length ? resData : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        that.setData({rates:rates})
        
      },
      fail: function (res) {

      },
      complete: function (res) {
        that.setData({ manageType: 3, products: [], agents: []})
        wx.hideLoading()
      }
    })
  },

  changeType: function (e) {
    var that = this;
    var manaType = this.MANAGE_TYPE;
    var t = +e.target.dataset.type
    switch (t) {
      case manaType.PRODUCT: 
        this.getProducts()
        break
      case manaType.AGENT: 
        this.getAgents()
        break
      case manaType.RATE:
        this.getRates()
    }
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
    this.getProducts()
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
      delta:1
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
console.log('pull down')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 上传图片接口
  doUpload: function () {
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy('正在上传')
        var filePath = res.tempFilePaths
        var images = []
        for (var i = 0, l = filePath.length; i < l; i++) {
          // 上传图片
          wx.uploadFile({
            url: config.service.uploadUrl,
            filePath: filePath[i],
            name: 'file',

            success: function (res) {
              util.showSuccess('上传图片成功')
              res = JSON.parse(res.data)
              console.log(res)
              images.push(res.data.imgUrl)
              if (images.length == l) {
                console.log(images);
                that.setData({
                  images: images
                })
              }
            },

            fail: function (e) {
              wx.showToast({title:'上传图片失败'})
            }
          })
        }
      },
      fail: function (e) {
        console.error(e)
      }
    })
  },

  // 预览图片
  previewImg: function (e) {
    var t = e.target;
    var data = t.dataset;
    wx.previewImage({
      current: data.url,
      urls: [data.url]
    })
  },

  productSubmit: function (e) {
    if (!this.data.images || !this.data.images.length) {
      wx.showToast({
        title: '请先上传商品图片',
        icon: 'none'
      })
      return
    }
    var that = this;
    var value = e.detail.value
    var keys = Object.keys(value);
    keys.sort();
    var param = []
    for (var i = 0, l = keys.length / 4; i < l; i++) {
      param.push({
        description: value[keys[i]],
        image: value[keys[i + l]],
        name: value[keys[i + 2 * l]],
        unitPrice: value[keys[i + 3 * l]]
      })
    }
    console.log(param)
    wx.request({
      url: config.service.productsUrl,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: param,

      success: function (res) {
        console.log(res)
        var products = []
        var goods = []
        res.data.data.forEach(function (e) {
          products.push({
            description: e.description,
            id: e.id,
            image: e.image,
            name: e.fruit_name,
            unitPrice: e.unit_price
          })
          goods.push({
            quantity: 0
          })
        })
        that.setData({
          products: products,
          images: []
        })
      },

      fail: function (res) {
        wx.showToast({title:'保存数据失败'})
      },
      complete: function () {
        wx.showToast({title:'保存成功'})
      }
    })
  },

  agentSubmit: function (e) {
    var that = this
    var values = e.detail.value
    wx.request({
      url: config.service.agentsUrl,
      method: 'POST',
      data: values,
      success: function (res) {
        console.log(res.data.data)
      },
      fail: function (res) {
        wx.showToast({title:'保存数据失败'})
      },
      complete: function (res) {
        wx.showToast({ title: '添加成功' })
        that.setData({ addAgent: 'none' })
      }
    })
  },

  rateSubmit: function (e) {
    var that = this
    var values = e.detail.value
    var keys = Object.keys(values)
    keys.sort()
    var params = []
    for (var i = 0, l = keys.length/2; i < l; i++) {
      if (!values[keys[i]] || !values[keys[i + l]]){
        continue
      }
      params.push({
        level: values[keys[i]],
        rate: values[keys[i + l]]
      })
    }
    wx.request({
      url: config.service.ratesUrl,
      method: 'POST',
      data: params,
      success: function (res) {

      },
      fail: function (res) {
        wx.showToast({title:'保存数据失败'})
      },
      complete: function () {
        wx.showToast({
          title: '保存成功'
        })
      }
    })
  },

  deleteProd: function (e) {
    console.log(e)
    wx.showModal({
      content: '确定删除吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: config.service.deleteProdUrl,
            method: 'DELETE',
            data: {
              id: e.target.dataset.pid
            },
            success: function (res) {
              console.log('delete successfullly', res)
            },
            fail: function () {
              console.log('delete failed', res)
            }
          })
        } else if (res.cancel) {
          
        }
      }
    })
  },

  updateProd: function (e) {
    wx.showModal({
      content: '确定修改吗',
      success: function (res) {
        if (res.confirm) {
        wx.request({
          url: config.service.updateProdUrl,
          method: 'POST',
          data: e.detail.value,
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
  }
})