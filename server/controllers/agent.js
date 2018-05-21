const query = require('../mysql/query.js')
var rates

async function calculateDeduct(total, total_price) {
  if (!rates) rates = await query('select * from df_rate')
  var deduct = {}
  if (total < rates[0].rate_level) {
    deduct.amount = total_price * rates[0].rate / 100 || 0
    deduct.rateFrom = rates[0].rate || 0
    deduct.rateTo = rates[1].rate || 1
    deduct.rate = total / rates[0].rate_level*100 + '%'
  }
  if (total >= rates[rates.length - 1].rate_level) {
    deduct.amount = total_price * rates[rates.length - 1].rate / 100
  }
  for (var i = 1, l = rates.length - 1; i < l; i++) {
    if (total >= rates[i - 1].rate_level && total < rates[i].rate_level) {
      deduct.amount = total_price * rates[i].rate / 100
      deduct.rateFrom = rates[i].rate
      deduct.rateTo = rates[i+1].rate
      deduct.rate = (total - rates[i - 1].rate_level) / (rates[i].rate_level - rates[i - 1].rate_level) * 100 + '%'
      break
    }
  }
  return deduct
}
async function getAgents() {
  var agentSql = 'SELECT * FROM df_agent a ORDER BY a.join_time DESC'
  var agents = await query(agentSql)
  console.log(agents)
  var deduct = {}
  for (var i = 0, l = agents.length; i < l; i++) {
    var totalSql = 'SELECT sum(`real_total_price`) realAmount,sum(`original_total_price`) originalAmount, sum(`total_quantity`) quantity from df_order where agent_open_id=?'
    var total = await query(totalSql, agents[i].open_id)
    agents[i].totalQuantity = total[0].quantity
    agents[i].totalAmount = total[0].realAmount
    var deduct = await calculateDeduct(total[0].quantity, total[0].originalAmount)
    deduct.amount = deduct.amount + total[0].realAmount - total[0].originalAmount
    agents[i].deduct = deduct
  }
  return agents
}
module.exports = {
  
  post: async ctx => {
    console.log(ctx.request)
    var agents = await getAgents()
    ctx.state.data = agents
  },

  get: async ctx => {
    var agents = await getAgents()
    ctx.state.data = agents
  },

  checkAgent: async ctx => {
    console.log(ctx)
    var sql = 'SELECT * FROM df_agent WHERE open_id = ?'
    var p = ctx.request.query
    var rows = await query(sql, p.openId)
    console.log(rows)
    ctx.state.data = rows
  },

  getAgent: async ctx => {
    console.log(ctx)    
    var sql = 'SELECT * FROM df_agent WHERE open_id = ?'
    var p = ctx.request.query
    var rows = await query(sql, p.openId)
    console.log(rows)
    ctx.state.data = rows
  },

  getAgentSummary: async ctx => {
    console.log(ctx)
    var p = ctx.request.query
    var params = [p.openId, p.startDate + ' 00:00:00', p.endDate + ' 23:59:59']
    var orderSql = 'SELECT sum(total_quantity) quantity, sum(real_total_price) realAmount, sum(original_total_price) originalAmount FROM df_order WHERE agent_open_id=? and created_time > ? and created_time < ?'
    var rows = await query(orderSql, params)
    console.log(rows)
    var personalTotal = 0, personalAmount = 0, orderIds = []
    var deduct
    var self = await query('SELECT * FROM `df_agent` WHERE open_id=?', p.openId)
    var childernSql = 'SELECT open_id FROM `df_agent` WHERE parent_open_id=?'
    // if (self[0].ancestor_open_id && self[0].parent_open_id) {
    //   childernSql = 
    // } else if(self[0].ancestor_open_id) {
    //   deduct = await calculateDeduct(rows[0].quantity, rows[0].originalAmount)
    //   deduct.amount = (deduct.amount + rows[0].realAmount || 0 - rows[0].originalAmount || 0).toFixed(2)
    //   ctx.state.data = {
    //     pQuantity: rows[0].quantity || 0,
    //     pAmount: rows[0].realAmount ? rows[0].realAmount.toFixed(2):'0.00',
    //     pDeduct: deduct,
    //     cQuantity: 0,
    //     cAmount: 0
    //   }
    //   return
    // }
    var children = await query(childernSql, p.openId)
    var cIds = []
    children.forEach(function (e) {
      cIds.push(e.open_id)
    })
    if (!cIds.length) {
      deduct = await calculateDeduct(rows[0].quantity, rows[0].originalAmount)
      deduct.amount = (deduct.amount + rows[0].realAmount || 0 - rows[0].originalAmount || 0).toFixed(2)
      // if (isFirstLevel) deduct.amount = rows[0].quantity
      ctx.state.data = {
        pQuantity: rows[0].quantity || 0,
        pAmount: rows[0].realAmount ? rows[0].realAmount.toFixed(2) :'0.00',
        pDeduct: deduct || {rateFrom: 0, rateTo: 1, rateLevel: 1},
        cQuantity: 0,
        cAmount: 0
      }
      return
    }
    var cOrderSql = 'SELECT sum(total_quantity) quantity, sum(real_total_price) realAmount, sum(original_total_price) originalAmount FROM df_order WHERE agent_open_id in (?) and created_time > ? and created_time < ?'
    var cparams = [cIds, p.startDate + ' 00:00:00', p.endDate + ' 23:59:59']
    var cOrders = await query(cOrderSql, cparams)
    deduct = await calculateDeduct(rows[0].quantity+cOrders[0].quantity, rows[0].originalAmount)
    deduct.amount = (+deduct.amount + +rows[0].realAmount - rows[0].originalAmount + cOrders[0].originalAmount*0.03).toFixed(2)
    var dcOrders =[{ quantity: 0, realAmount: 0, originalAmount: 0}]
    if (!self[0].ancestor_open_id && self[0].parent_open_id) {
        var dchildrenSql = 'SELECT open_id FROM `df_agent` WHERE ancestor_open_id=?'
        var dcOpenids = await query(dchildrenSql, p.openId)
        var dcIds = []
        dcOpenids.forEach(function (e) {
          dcIds.push(e.open_id)
        })
        var dcparams = [dcIds, p.startDate + ' 00:00:00', p.endDate + ' 23:59:59']
        dcOrders = await query(cOrderSql, dcparams)
        deduct.amount = (+deduct.amount + +dcOrders[0].originalAmount * 0.01).toFixed(2)
    }
    ctx.state.data = {
      pQuantity: rows[0].quantity,
      pAmount: rows[0].realAmount ? rows[0].realAmount.toFixed(2) : '0.00',
      pDeduct: deduct,
      cQuantity: cOrders[0].quantity || 0 + dcOrders[0].quantity || 0,
      cAmount: +(cOrders[0].originalAmount || 0) + +dcOrders[0].originalAmount
    }
    return
  },

  applyAgent: async ctx => {
    console.log(ctx)
    var v = ctx.request.body;
    var parentResult = await query('SELECT * FROM `df_agent`WHERE open_id=?', v.parentOpenId)
    var ancestorOpenId = ''
    if (parentResult.length) {
    var parentAgent = parentResult[0]
    ancestorOpenId = (!parentAgent.ancestor_open_id && !parentAgent.parent_open_id) ? '' : (!parentAgent.ancestor_open_id ? parentAgent.open_id : parentAgent.ancestor_open_id)
    }
    var sql = 'INSERT INTO df_agent(`open_id`, `parent_open_id`, `ancestor_open_id`, `nick_name`, `province`, `city`, `agent_name`, `agent_phone`, `sender_name`, `sender_phone`) values ?';

    var rows = await query(sql, [[[v.openId, v.parentOpenId, ancestorOpenId, v.nickName, v.province, v.city, v.agentName, v.agentPhone, v.senderName, v.senderPhone]]], function (err, rows) {
      if (err) {
        console.log('INSERT ERROR - ', err.message);
        return;
      }
    });
    ctx.state.data = rows
  }
}