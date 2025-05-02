import {
    Description,
    Code,
    Image,
    PictureAsPdf,
    AudioFile,
    VideoFile,
    FolderZip,
    Article,
    Terminal,
    IntegrationInstructions,
    Css,
    Html,
    DataObject,
    Feed,
    Settings,
    AppSettingsAlt,
    AccountTree,
    Source,
    Folder,
    FolderSpecial,
} from '@mui/icons-material';

// File extension to icon mapping
export const fileIconsMap = {
    // Images
    'png': Image,
    'jpg': Image,
    'jpeg': Image,
    'gif': Image,
    'svg': Image,
    'webp': Image,

    // Documents
    'pdf': PictureAsPdf,
    'doc': Description,
    'docx': Description,
    'txt': Article,
    'md': Article,

    // Code
    'js': IntegrationInstructions,
    'jsx': IntegrationInstructions,
    'ts': IntegrationInstructions,
    'tsx': IntegrationInstructions,
    'css': Css,
    'scss': Css,
    'sass': Css,
    'html': Html,
    'json': DataObject,
    'xml': Feed,
    'py': Code,
    'java': Code,
    'cpp': Code,

    // Config files
    'yml': Settings,
    'yaml': Settings,
    'env': AppSettingsAlt,

    // Archives
    'zip': FolderZip,
    'rar': FolderZip,
    'tar': FolderZip,
    'gz': FolderZip,

    // Media
    'mp3': AudioFile,
    'wav': AudioFile,
    'mp4': VideoFile,
    'avi': VideoFile,
};

// Special folder name to icon mapping
export const folderIconsMap = {
    'src': Source,
    'source': Source,
    'node_modules': AppSettingsAlt,
    'dist': AccountTree,
    'build': AccountTree,
    'public': FolderSpecial,
    'assets': FolderSpecial,
    'images': Image,
    'img': Image,
    'docs': Description,
};

// Get icon for file based on extension
export const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return fileIconsMap[extension] || Description;
};

// Get icon for folder based on name
export const getFolderIcon = (folderName) => {
    const normalizedName = folderName.toLowerCase();
    return folderIconsMap[normalizedName] || Folder;
};