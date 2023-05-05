import {defaultTheme} from 'vuepress';
import {searchPlugin} from '@vuepress/plugin-search';
import {pwaPlugin} from '@vuepress/plugin-pwa';

export default {
    title: '每天一张图 发现新世界',
    base: '/',
    lang: 'zh-CN',
    head: [
        ['link', {rel: 'manifest', href: '/manifest.json'}],
        ['script', {type: 'text/javascript', src: 'https://hm.baidu.com/hm.js?a77f81bd4291612762d3e1a6ea437379'}],
    ],
    plugins: [
        searchPlugin({
            // 配置项
        }),
        pwaPlugin({
            skipWaiting: true
        })
    ],
    theme: defaultTheme({
        logo: '/icon300.jpg',
        repo: 'eruoxi/eruoxi.github.io',
        // 默认主题配置
        navbar: (() => {
            let nav = [{
                text: '首页',
                link: '/index.html',
            }];
            let today = new Date();
            today.setMinutes(today.getMinutes() + today.getTimezoneOffset() + 480);
            let minDay = new Date('2019/12/1');
            let yearNav = {
                text: today.getFullYear(),
                children: []
            };
            while (today > minDay) {
                if (today.getMonth() === 11 && yearNav.children.length > 0) {
                    nav.push(yearNav);
                    yearNav = {
                        text: today.getFullYear(),
                        children: []
                    }
                }
                yearNav.children.unshift({
                    text: today.getFullYear() + '/' + (today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1),
                    link: '/' + today.getFullYear() + '/' + today.getFullYear() + (today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1) + '.html'
                });
                today.setMonth(today.getMonth() - 1);
            }
            nav.push({
                text: '关于',
                link: '/about.html',
            });
            return nav;
        })(),
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdatedText: '上次更新',
        contributorsText: '贡献者',
    }),
}