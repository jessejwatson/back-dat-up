const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config'); // Importing configuration

// Use the log file path from the configuration
const LOG_FILE = CONFIG.logFile;

// Function to log messages
const logMessage = (message) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync(LOG_FILE, formattedMessage, { flags: 'a' });
};

const mountDrive = () => {
    return new Promise((resolve, reject) => {
        exec(`mount ${CONFIG.device} ${CONFIG.mountPoint}`, (error) => {
            if (error) {
                logMessage(`Drive mount failed: ${error}`);
                return reject('Drive mount failed');
            }
            logMessage('Drive mounted successfully');
            resolve();
        });
    });
};

const unmountDrive = () => {
    return new Promise((resolve, reject) => {
        exec(`umount ${CONFIG.mountPoint}`, (error) => {
            if (error) {
                logMessage(`Drive unmount failed: ${error}`);
                return reject('Drive unmount failed');
            }
            logMessage('Drive unmounted successfully');
            resolve();
        });
    });
};

// Function to create a backup
const createBackup = async () => {
    const date = new Date().toISOString().split('T')[0];
    const backupFolderName = `backup-${date}`;
    const backupFolderPath = path.join(CONFIG.backupDir, backupFolderName);

    await fs.promises.mkdir(backupFolderPath, { recursive: true });

    const backupPromises = CONFIG.directoriesToBackup.map(dir => {
        const destination = path.join(backupFolderPath, path.basename(dir));
        return exec(`cp -r ${dir} ${destination}`);
    });

    await Promise.all(backupPromises);
    logMessage('Backup successful: ' + backupFolderName);
    CONFIG.notificationCommand('Backup successful: ' + backupFolderName);
};

// Function to clean up old backups
const cleanupOldBackups = async () => {
    const backups = await fs.promises.readdir(CONFIG.backupDir);
    if (backups.length > CONFIG.maxBackups) {
        backups.sort(); // Sort to find the oldest
        const oldBackups = backups.slice(0, backups.length - CONFIG.maxBackups);
        const deletionPromises = oldBackups.map(backup => {
            const backupPath = path.join(CONFIG.backupDir, backup);
            return fs.promises.rm(backupPath, { recursive: true, force: true });
        });

        await Promise.all(deletionPromises);
        logMessage(`Deleted old backups: ${oldBackups.join(', ')}`);
    }
};

// Main function to run the backup process
const runBackup = async () => {
    try {
        await mountDrive();
        await createBackup();
        await cleanupOldBackups();
        await unmountDrive();
    } catch (error) {
        logMessage('Backup failed: ' + error);
        CONFIG.notificationCommand('Backup failed: ' + error);
        console.error(error);
    }
};

// Execute the backup
runBackup();
