var query = require('../mysql/query.js')

function addZero(arg) {
  return arg >= 10 ? arg : '0' + arg;
}

module.exports = {
  post: async ctx => {
    console.log(ctx.req)
    var date = new Date();
    var order_id = date.getFullYear() + addZero(date.getMonth() + 1) + addZero(date.getDate()) + addZero(date.getHours()) + addZero(date.getMinutes()) + addZero(date.getSeconds()) + Math.ceil(Math.random() * 10000);
    var order_sql = 'INSERT INTO df_order(`id`,`agent_open_id`, `buyer_open_id`, `buyer_name`, `buyer_phone`, `province`, `city`, `county`, `detail_info`, `postal_code`, `original_total_price`, `real_total_price`,`total_quantity`, `order_status`) values ?';

    var order_line_sql = 'INSERT INTO df_order_line(`order_id`,`fruit_id`,`fruit_name`, `quantity`, `original_price`,`real_price`, `line_status`) values ?'
    var o = ctx.request.body;
    var ols = o.orderLines
    var values = []
    var total_quantity = 0, original_total_price = 0, real_total_price = 0, pids = []
    for (var i = 0, l = ols.length; i < l; i++) {
      var product_sql = 'SELECT f.*,af.agent_price agent_price FROM df_fruit f left join df_agent_price af on f.id=af.fruit_id and f.id = ? and af.agent_open_id=?'
      var product = await query(product_sql, [ols[i].pid, o.agentOpenId])
      ols[i].original_price = product[0].unit_price
      ols[i].real_price = product[0].agent_price || product[0].unit_price
      ols[i].name = product[0].fruit_name
      total_quantity += ols[i].quantity
      original_total_price += ols[i].quantity * product[0].unit_price
      real_total_price += ols[i].quantity * ols[i].real_price
    }
    var result = await query(order_sql, [[[order_id, o.agentOpenId, o.buyerOpenId, o.buyerName, o.buyerPhone, o.province, o.city, o.county, o.detailInfo, o.postalCode, original_total_price, real_total_price, total_quantity,'DRAFT']]])
    ols.forEach(function (e) {
      values.push([order_id, e.pid, e.name, e.quantity, e.original_price, e.real_price, 'DRAFT'])
    })

    var lineIds = await query(order_line_sql, [values])


    // var order = [[params.agent, params.buyer, original_total_price, real_total_price]]
    // var order_id = await query(order_sql, [order])
    // values.forEach(function(e) {
    //   e.order_id = order_id
    // })
    // var orderLineIds = await query(order_line_sql, values)


  },
  
  getSelfOrders: async ctx => {
    var p = ctx.request.query
    var oIdSql = 'SELECT id FROM `df_order` WHERE agent_open_id=? and created_time > ? and created_time < ?'
    var orderIds = await query(oIdSql, [p.openId, p.startDate+' 00:00:00', p.endDate+' 23:59:59'])
    var ids = []
    orderIds.forEach(function(e){
      ids.push(e.id)
    })
    var lineSql = 'SELECT * FROM df_order_line WHERE order_id in (?) and created_time > ? and created_time < ?'
    var lines = await query(lineSql, [ids, p.startDate + ' 00:00:00', p.endDate + ' 23:59:59'])
    ctx.state.data = lines
  },

  getTeamOrders: async ctx => {
    var openId = ctx.request.query.openId
    var memberSql = 'SELECT open_id from `df_agent` WHERE parent_open_id=?'
    var memberIds = await query(memberSql, openId)
    var oIdsql = 'SELECT id FROM `df_order` WHERE `open_id` in?'
    var orderIds = await query(oIdsql, openId)
    var lineSql = 'SELECT * FROM df_order_line WHERE order_id in (?)'
    var lines = await query(lineSql, orderIds)
    ctx.state.data = lines
  }
}