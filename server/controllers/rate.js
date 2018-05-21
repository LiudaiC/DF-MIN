const query = require('../mysql/query.js')

module.exports = {
  post: async ctx => {
    console.log(ctx.request)
    
    var sql = 'INSERT INTO df_rate(`rate_level`, `rate`) values ?';
    var params = ctx.request.body;
    var values = [];
    params.forEach(function (p) {
      values.push([p.level, p.rate])
    });
    var numbers = await query(sql, [values], function (err, rows) {
      if (err) {
        console.log('INSERT ERROR - ', err.message);
        return;
      }
      console.log("INSERT SUCCESS");
    });
    ctx.state.data = params
  },

  get: async ctx => {
    var sql = 'SELECT * FROM df_rate'
    var rows = await query(sql)
    console.log(rows)
    ctx.state.data = rows
  }
}