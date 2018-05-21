/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://choxkyuh.qcloud.la';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        // demoUrl: `${host}/weapp/demo`,

        productsUrl: `${host}/weapp/products`,
        deleteProdUrl: `${host}/weapp/products/deleteProd`,
        updateProdUrl: `${host}/weapp/products/updateProd`,
        agentUpdateProdUrl: `${host}/weapp/products/agentUpdateProd`,
        ratesUrl: `${host}/weapp/rates`,


        agentsUrl: `${host}/weapp/agents`,
        getAgent: `${host}/weapp/getAgent`,
        getAgentSummary: `${host}/weapp/getAgentSummary`,
        checkAgent: `${host}/weapp/checkAgent`,
        applyAgentUrl: `${host}/weapp/agents/applyAgent`,
        getTeamOrders: `${host}/weapp/getTeamOrders`,
        ordersUrl: `${host}/weapp/orders`,
        getSelfOrders: `${host}/weapp/getSelfOrders`,
        
    }
};

module.exports = config;
