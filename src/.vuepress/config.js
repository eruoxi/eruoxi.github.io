import {defaultTheme} from 'vuepress';

export default {
    title: '个人主页',
    base: '/',
    theme: defaultTheme({
        repo: 'answer-3/answer-3.github.io.git',
        // 默认主题配置
        navbar: (() => {
            let nav = [{
                text: '首页',
                link: '/index.html',
            }, {
                text: 'Blog',
                link: '/Blog/index.html',
            }, {
                text: 'BingWallpaper',
                children: [{
                    text: '最近15天',
                    link: '/BingWallpaper/index.html',
                }]
            }, {
                text: '关于',
                link: '/about.html',
            }];
            let today = new Date();
            let minDay = new Date('2019/12/1');
            let BingWallpaperChildren = nav[2].children;
            let yearNav = {
                text: today.getFullYear(),
                children: []
            };
            while (today > minDay) {
                if (today.getMonth() === 11 && yearNav.children.length > 0) {
                    BingWallpaperChildren.push(yearNav);
                    yearNav = {
                        text: today.getFullYear(),
                        children: []
                    }
                }
                yearNav.children.unshift({
                    text: today.getFullYear() + '/' + (today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1),
                    link: '/BingWallpaper/' + today.getFullYear() + '/' + today.getFullYear() + (today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1) + '.html'
                });
                today.setMonth(today.getMonth() - 1);
            }
            return nav;
        })(),
    }),
}