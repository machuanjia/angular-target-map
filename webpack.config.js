/**
 * Created by yanshi0429 on 17/8/3.
 */

var path = require('path');

var htmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry:{
        main:'./src/main.js',
        app:'./src/app.js'
    },
    output:{
        path:path.join(__dirname,'/dist'),
        filename:'js/[name].js'
    },
    module:{
        rules:[{
            test:/\.js$/,
            include: path.resolve(__dirname,'src'),
            exclude: /(node_modules|bower_components)/,
            use:{
                loader:'babel-loader',
                options:{
                    presets: ['env']
                }
            }
        }
        // ,{
        //     test:/\.css$/,
        //     use: [
        //         'style-loader',
        //         {
        //             loader: 'css-loader',
        //             options: {
        //                 importLoaders: 1
        //             }
        //         },
        //         'postcss-loader'
        //     ]
        // }
            , {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader",'postcss-loader','less-loader'],
                    publicPath: "/dist"
                }),


            // use: [{
            //     loader: "style-loader"
            // }, {
            //     loader: "css-loader"
            // },{
            //     loader:"postcss-loader"
            // }, {
            //     loader: "less-loader", options: {
            //         strictMath: true,
            //         noIeCompat: true
            //     }
            // }]
        },{
            test:/\.html/,
            use:[{
                loader:'html-loader'
            }]
        },{
            test:/\.ejs$/,
            use:{
                loader:'ejs-loader'
            }
        }
        // ,{
        //     test:/\.(png|jpg|gif)$/i,
        //     use:{
        //         loader:'url-loader',
        //         query: {
        //             limit: 30000,
        //             name:'css/[name]-[hash:5].[ext]'
        //         }
        //     }
        // }
        ]
    },
    plugins:[
        new htmlWebpackPlugin({
            filename:'index.html',
            template:'index.ejs',
            title:'target map',
            inject:false
        }),
        new ExtractTextPlugin({
            filename: "css/map.css",
            disable: false,
            allChunks: true
        })
    ]
}