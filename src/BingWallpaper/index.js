const fs = require('fs');
let getEnddate = mediaContent => {
    if (!mediaContent.enddate && mediaContent.FullDateString) {
        let enddate = mediaContent.FullDateString.replace('月', '').split(' ');
        mediaContent.enddate = enddate[0] + (enddate[1] < 10 ? '0' : '') + enddate[1] + (enddate[2] < 10 ? '0' : '') + enddate[2];
    }
    return mediaContent.enddate;
}

let getFilePath = (enddate, fileType) => {
    if (typeof enddate == 'object') {
        let date = new Date(enddate);
        enddate = date.getFullYear() + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + (date.getDate() < 10 ? '0' : '') + date.getDate();
    }
    let filePath = './src/BingWallpaper/' + enddate.substring(0, 4) + (fileType === '.jpg' ? '/' + enddate.substring(0, 6) : '');
    try {
        fs.mkdirSync(filePath, {recursive: true});
    } catch (e) {
    }
    return filePath + '/' + (fileType === '.jpg' ? enddate : enddate.substring(0, 6)) + fileType;
}

let getMediaContents = (filePath) => {
    let mediaContents;
    try {
        mediaContents = fs.readFileSync(filePath, {encoding: 'utf-8'});
        mediaContents = JSON.parse(mediaContents);
    } catch (e) {
        // console.error(e);
        mediaContents = [];
    }
    return mediaContents;
}

let updateJSONFile = mediaContents => {
    if (mediaContents && Array.isArray(mediaContents) && mediaContents.length > 0) {
        let MediaContentsCache = new Map;
        mediaContents.forEach(mediaContent => {
            let enddate = getEnddate(mediaContent);
            let jsonFile = getFilePath(enddate, '.json',);
            let mediaContents = MediaContentsCache.get(jsonFile);
            if (!mediaContents) {
                mediaContents = getMediaContents(jsonFile);
                MediaContentsCache.set(jsonFile, mediaContents);
            }
            mediaContents.push(mediaContent);
        });
        MediaContentsCache.forEach((fileContent, filePath) => {
            let keySet = new Set();
            let jsonStr = '[\r\n';
            fileContent.sort((a, b) => {
                return getEnddate(a) > getEnddate(b) ? 1 : -1;
            }).forEach(mediaContent => {
                if (!keySet.has(getEnddate(mediaContent))) {
                    jsonStr += JSON.stringify(mediaContent) + ',\r\n';
                    keySet.add(getEnddate(mediaContent));
                }
            });
            jsonStr = (jsonStr + ']').replace('},\r\n]', '}\r\n]');
            try {
                fs.writeFileSync(filePath, jsonStr, null);
                updateMDFile(JSON.parse(jsonStr), filePath.replace('.json', '.md'));
            } catch (e) {
                console.error(e);
            }
        })
    }
}

let addHost = url => {
    let result = url;
    if (!result.startsWith("http")) {
        result = 'https://cn.bing.com' + result;
    }
    return result;
}

let getFrontmatter = filePath => {
    let frontmatter = '';
    let fileName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
    let fileDate = fileName === 'README' ? getNewDate() : new Date(fileName.substring(0, 4) + '/' + fileName.substring(4, 6) + '/1');
    if (process.argv.includes('--forVuePress')) {
        let prevMonth = new Date(fileDate);
        prevMonth.setMonth(fileDate.getMonth() + 1);
        let nextMonth = new Date(fileDate);
        nextMonth.setMonth(fileDate.getMonth() - 1);
        let thisDate = getNewDate();
        frontmatter += `---
`;
        if (prevMonth.getFullYear() < thisDate.getFullYear() || (prevMonth.getFullYear() === thisDate.getFullYear() & prevMonth.getMonth() <= thisDate.getMonth())) {
            frontmatter += `prev:
  text: ${prevMonth.getFullYear()}/${prevMonth.getMonth() < 9 ? '0' : ''}${prevMonth.getMonth() + 1}
  link: ../${prevMonth.getFullYear()}/${prevMonth.getFullYear()}${(prevMonth.getMonth() < 9 ? '0' : '') + (prevMonth.getMonth() + 1)}.html
`;
        } else if (fileName !== 'README') {
            frontmatter += `prev:
  text: 最近15天
  link: ../index.html
`;
        }
        if (fileName === 'README') {
            frontmatter += `next:
  text: ${thisDate.getFullYear()}/${thisDate.getMonth() < 9 ? '0' : ''}${thisDate.getMonth() + 1}
  link: ${thisDate.getFullYear()}/${thisDate.getFullYear()}${(thisDate.getMonth() < 9 ? '0' : '') + (thisDate.getMonth() + 1)}.html
`;
        } else if (nextMonth.getFullYear() >= 2020) {
            frontmatter += `next:
  text: ${nextMonth.getFullYear()}/${nextMonth.getMonth() < 9 ? '0' : ''}${nextMonth.getMonth() + 1}
  link: ../${nextMonth.getFullYear()}/${nextMonth.getFullYear()}${(nextMonth.getMonth() < 9 ? '0' : '') + (nextMonth.getMonth() + 1)}.html
`;
        }
        frontmatter += `---
`
    }
    frontmatter += `## Bing Wallpaper(${fileName === 'README' ? '最近15天' : (fileDate.getFullYear() + '年' + (fileDate.getMonth() + 1) + '月')})`;
    return frontmatter;
}

let updateMDFile = (mediaContents, filePath) => {
    let content = getFrontmatter(filePath);
    mediaContents.forEach((mediaContent) => {
        let fullDate = mediaContent.enddate.substring(4, 6) + '月' + mediaContent.enddate.substring(6, 8) + '日';
        content += `
### ${fullDate}：${mediaContent.ImageContent.Headline}
#### ${mediaContent.ImageContent.Title}（${mediaContent.ImageContent.Copyright}）

![${mediaContent.ImageContent.Headline}](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '800x480'))} "${mediaContent.ImageContent.Headline}")

${mediaContent.ImageContent.Description}

${mediaContent.ImageContent.QuickFact.MainText}

[Bing搜索](${addHost(mediaContent.ImageContent.BackstageUrl)} "Bing Wallpaper ${mediaContent.FullDateString}")
[必应主页测验](${addHost(mediaContent.ImageContent.TriviaUrl)} "必应主页测验 ${mediaContent.FullDateString}")
[下载480](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '800x480'))} "${mediaContent.ImageContent.Title}")
[下载720](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '1280x720'))} "${mediaContent.ImageContent.Title}")
[下载1080](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '1920x1080'))} "${mediaContent.ImageContent.Title}")
[下载UHD](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', 'UHD'))} "${mediaContent.ImageContent.Title}")

---`;
    });

    try {
        fs.writeFileSync(filePath, content, null);
    } catch (e) {
        console.error(e);
    }
}

let updateMD = (startDate, endDate) => {
    startDate = new Date(startDate || '2020/1/1');
    endDate = new Date(endDate || getNewDate());
    while (startDate < endDate) {
        let jsonFilePath = getFilePath(startDate, '.json');
        let mdFilePath = getFilePath(startDate, '.md');
        let mediaContents = getMediaContents(jsonFilePath);
        if (mediaContents && mediaContents.length > 0) {
            updateMDFile(mediaContents, mdFilePath);
        }
        startDate.setMonth(startDate.getMonth() + 1);
    }
    updateLastMD();
}

let getNewDate=()=>{
    let lastDate = new Date();
    lastDate.setMinutes(lastDate.getMinutes()+lastDate.getTimezoneOffset()+480);
    return lastDate;
}

let updateLastMD = () => {
    let lastDate = getNewDate();
    let lastMediaContents = getMediaContents(getFilePath(lastDate, '.json'));
    if (lastMediaContents.length < 15) {
        lastDate.setMonth(lastDate.getMonth() - 1);
        lastMediaContents = lastMediaContents.concat(getMediaContents(getFilePath(lastDate, '.json')));
    }
    updateMDFile(lastMediaContents.sort((a, b) => {
        return getEnddate(a) < getEnddate(b) ? 1 : -1;
    }).slice(0, 15), './src/BingWallpaper/README.md');
}

let loadLastImage = () => {
    console.log(`loadLastImage 开始时间：${new Date().toUTCString()}`);
    fetch(addHost('/hp/api/model'))
        .then(response => {
            response.json()
                .then(json => {
                    if (json.MediaContents) {
                        updateJSONFile(json.MediaContents);
                        updateLastMD();
                        console.log(`loadLastImage 结束时间：${new Date().toUTCString()}`);
                    } else {
                        console.error(json);
                    }
                })
                .catch(console.error);
        })
        .catch(console.error);
}
// exports.getFilePath = getFilePath;
// exports.getMediaContents = getMediaContents;
// exports.updateJSONFile = updateJSONFile;
// exports.updateMDFile = updateMDFile;
exports.updateMD = updateMD;
exports.loadLastImage = loadLastImage;
