# Configuration Guide

## Base URL Configuration

The API automatically detects the environment and sets the upload base URL:

- **Development**: `http://localhost/upload`
- **Production**: `https://www.calamuseducation.com/upload`

## File Storage

### Directory Structure

**Development:**
```
C:\xampp\htdocs\
├── calamus\
│   └── api\
└── upload\          <- Files saved here
    ├── users\
    ├── posts\
    └── ...
```

**Production:**
```
/
├── calamus\
│   ├── api\
│   └── (react app)
└── upload\          <- Files saved here
    ├── users\
    ├── posts\
    └── ...
```

### How It Works

From `api/` directory, the path `../../upload/` navigates:
- Up two levels to server root (`../../`)
- Then into `upload/` directory (`upload/`)

This works identically for both development and production environments.

- **Physical Storage**: Files saved to `../../upload/` (relative to api directory)
- **Database URL**: 
  - Development: `http://localhost/upload/users/filename.jpg`
  - Production: `https://www.calamuseducation.com/upload/users/filename.jpg`

### How It Works

1. **Automatic Detection**: The `config.php` file detects the environment by checking `$_SERVER['HTTP_HOST']`
   - If it contains `localhost` or `127.0.0.1`, it uses development settings
   - Otherwise, it uses production settings

2. **File Storage**: Files are physically stored in:
   - `calamus/uploads/users/` - User profile images
   - `calamus/uploads/posts/` - Post images
   - `calamus/uploads/chat/` - Chat images/voice
   - etc.

3. **Database URLs**: The URLs saved in the database will be:
   - Development: `http://localhost/upload/users/filename.jpg`
   - Production: `https://www.calamuseducation.com/upload/users/filename.jpg`

### Custom Configuration

To override the default settings, create a `config.local.php` file:

1. Copy `config.local.php.example` to `config.local.php`
2. Uncomment and modify the settings as needed:

```php
// Custom upload base URL
define('UPLOAD_BASE_URL', 'http://your-custom-url.com/upload');
```

### Usage in API Files

Include the config at the top of your API file:

```php
require_once '../config.php';
```

Then use the helper function to generate upload URLs:

```php
$relativePath = 'users/' . $fileName;
$fullUrl = getUploadUrl($relativePath);
// Returns: http://localhost/upload/users/filename.jpg (dev)
// or: https://www.calamuseducation.com/upload/users/filename.jpg (prod)
```

### Important Notes

- Make sure the `/upload` directory is properly configured in your web server (Apache/Nginx)
- The `/upload` directory should point to the `calamus/uploads/` folder
- This can be done via:
  - Apache: Virtual directory or symlink
  - Nginx: Alias configuration
  - Or by configuring the web server root
