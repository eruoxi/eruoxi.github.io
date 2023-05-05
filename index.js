const BingWallpaper = require('./src/BingWallpaper');

if (process.argv.includes('--loadLastImage')) {
    BingWallpaper.loadLastImage();
}
if (process.argv.includes('--updateMD')) {
    BingWallpaper.updateMD('2020/1/1');
}
