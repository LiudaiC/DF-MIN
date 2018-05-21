const query = require('../mysql/query.js')

module.exports = {
  post: async ctx => {
    console.log(ctx.request)

    var sql = 'INSERT INTO df_fruit(description, image, fruit_name, unit_price) values ?';
    var params = ctx.request.body;
    console.log(params)
    var values = [];
    params.forEach(function (p) {
      values.push([p.description, p.image, p.name, parseFloat(p.unitPrice)])
    });
    console.log(values)

    await query(sql, [values], function (err, rows) {
      if (err) {
        console.log('INSERT ERROR - ', err.message);
        return;
      }
      console.log("INSERT SUCCESS");
    });
    var sql = 'SELECT id, fruit_name, description, unit_price, image FROM df_fruit ORDER BY create_time DESC'
    var rows = await query(sql)
    ctx.state.data = rows
  },

  get: async ctx => {
    var sql = 'SELECT f.*, af.agent_price FROM df_fruit f left join df_agent_price af on f.id=af.fruit_id ORDER BY f.create_time DESC'
    var p = ctx.request.query
    if (p.agentOpenId) {
      sql = 'SELECT f.*, af.agent_price FROM df_fruit f left join df_agent_price af on f.id=af.fruit_id and af.agent_open_id=? ORDER BY f.create_time DESC'
    }
    var rows = await query(sql, ctx.request.query.agentOpenId)
    // var fIds = []
    // rows.forEach(function (e) {
    //   var asql = 'SELECT * FROM df_agent_price where fruit_id=?'
    //   var ap = await query(asql, e.id)
    // })

    console.log(rows)
    ctx.state.data = rows
  },
  
  deleteProd: async ctx => {
    console.log('delete', ctx)
    var deleteSql = 'DELETE FROM `df_fruit` WHERE id=?'
    var result = await query(deleteSql, ctx.request.body.id)
    console.log(result)
  },

  updateProd: async ctx => {
    console.log('update', ctx)
    var v = ctx.request.body
    var updateSql = 'UPDATE `df_fruit` SET fruit_name=?, unit_price=?, description=? WHERE id=?'
    var result = await query(updateSql, [v.fruit_name, v.unit_price, v.description, v.id])
    console.log(result)
  },

  agentUpdateProd: async ctx => {
    console.log('agent update',ctx)
    var v = ctx.request.body
    var getOb = await query('SELECT * from df_agent_price where agent_open_id=? and fruit_id=?', [v.agentOpenId, v.id])
    var rows
    if(getOb.length) {
      rows = await query('UPDATE df_agent_price set agent_price=? where agent_open_id=? and fruit_id=?', [v.agentPrice, v.agentOpenId, v.id])
    } else {
      var params = [v.agentOpenId, v.id, v.agentPrice]
      rows = await query('INSERT into df_agent_price(`agent_open_id`,`fruit_id`, `agent_price`) values ?', [[params]])
    }    
    console.log(rows)
  }

}