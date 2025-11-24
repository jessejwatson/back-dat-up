const CONFIG = {
    device: '/dev/sdb1',
    mountPoint: '/media/ssd1', // Adjust the mount point
    backupDir: '/media/ssd1/back-dat-up', // Backup folder on the external drive
    directoriesToBackup: [
        '/home/administrator/docker-volumes/'
    ],
    logFile: '/var/log/back-dat-up/backups.log',
    //notificationCommand: (message) => {
    //    const exec = require('child_process').exec;
    //    exec(`echo "${message}" | mail -s "Backup Notification" user@example.com`, (err, stdout, stderr) => {
    //        if (err) console.error(`Error sending notification: ${stderr}`);
    //    });
    //},
    maxBackups: 30, // Maximum number of backups to keep
};

module.exports = CONFIG;
