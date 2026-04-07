# DevNotes - Deployment Guide

## 📁 Project Structure

```
devnotes/
├── backend/               # PHP API + SQLite
│   ├── api.php           # REST API endpoints
│   ├── .htaccess         # Apache config
│   └── devnotes.db       # SQLite database (auto-created)
│
└── frontend/             # React app
    ├── src/
    │   ├── App.jsx       # Main component
    │   ├── main.jsx      # Entry point
    │   └── index.css     # Styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🚀 Quick Deployment Guide

### Step 1: Backend Setup (PHP + SQLite)

1. **Upload backend files to your server:**
   ```bash
   # Upload to your web server directory
   /var/www/devnotes/backend/
   ```

2. **Set permissions:**
   ```bash
   # Make the backend directory writable (for SQLite database)
   sudo chown -R www-data:www-data /var/www/devnotes/backend
   sudo chmod 755 /var/www/devnotes/backend
   ```

3. **Verify PHP and SQLite are installed:**
   ```bash
   php -v                    # Should show PHP 7.4+
   php -m | grep sqlite3     # Should show sqlite3
   ```

4. **Test the API:**
   ```bash
   curl http://your-domain.com/devnotes/backend/api.php?action=getAllNotes
   # Should return: []
   ```

---

### Step 2: Frontend Setup (React)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL:**
   
   Edit `frontend/src/App.jsx`, line 4:
   ```javascript
   // Change this to your actual server URL
   const API_URL = 'https://your-domain.com/devnotes/backend/api.php';
   ```

3. **Update base path (if needed):**
   
   Edit `frontend/vite.config.js`:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/devnotes/', // Change to your path or '/' for root
   })
   ```

4. **Build for production:**
   ```bash
   npm run build
   # Creates optimized files in frontend/dist/
   ```

5. **Deploy the build:**
   ```bash
   # Copy dist folder contents to your web server
   cp -r dist/* /var/www/devnotes/
   ```

---

### Step 3: Final Directory Structure on Server

```
/var/www/devnotes/
├── index.html              # React app entry (from dist)
├── assets/                 # JS/CSS bundles (from dist)
│   ├── index-xyz.js
│   └── index-xyz.css
└── backend/
    ├── api.php
    ├── .htaccess
    └── devnotes.db         # Auto-created on first use
```

---

## 🔧 Apache Configuration

If you need a virtual host, add this to your Apache config:

```apache
<VirtualHost *:80>
    ServerName devnotes.your-domain.com
    DocumentRoot /var/www/devnotes

    <Directory /var/www/devnotes>
        AllowOverride All
        Require all granted
        
        # SPA fallback - redirect all to index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    <Directory /var/www/devnotes/backend>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Then:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## 🔐 Security Recommendations

1. **Protect the database file:**
   
   The `.htaccess` already denies direct access to `.db` files, but verify:
   ```bash
   curl http://your-domain.com/devnotes/backend/devnotes.db
   # Should return: 403 Forbidden
   ```

2. **Update CORS settings:**
   
   Edit `backend/api.php`, line 10:
   ```php
   // Change from '*' to your specific domain
   header('Access-Control-Allow-Origin: https://your-domain.com');
   ```

3. **Add authentication (optional):**
   
   Add basic auth to `backend/api.php`:
   ```php
   // At the top of api.php
   if (!isset($_SERVER['PHP_AUTH_USER']) || 
       $_SERVER['PHP_AUTH_USER'] !== 'your-username' || 
       $_SERVER['PHP_AUTH_PW'] !== 'your-password') {
       header('WWW-Authenticate: Basic realm="DevNotes"');
       header('HTTP/1.0 401 Unauthorized');
       echo 'Unauthorized';
       exit;
   }
   ```

---

## 🧪 Testing Checklist

After deployment, test:

- [ ] Open the app in browser
- [ ] Create a new note
- [ ] Edit note content (should auto-save)
- [ ] Refresh page (notes should persist)
- [ ] Create multiple tabs
- [ ] Close a tab
- [ ] Search notes
- [ ] Export notes (download JSON)
- [ ] Import notes (upload JSON)
- [ ] Check different modes (Markdown, Code, Plain)

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch notes"
**Solution:** Check:
- API URL is correct in `App.jsx`
- CORS headers are set in `api.php`
- PHP errors: `tail -f /var/log/apache2/error.log`

### Issue: Database permission errors
**Solution:**
```bash
sudo chown www-data:www-data /var/www/devnotes/backend
sudo chmod 755 /var/www/devnotes/backend
```

### Issue: 404 on API calls
**Solution:** Enable mod_rewrite:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Issue: Blank page after build
**Solution:** Check browser console for errors. Usually means wrong `base` path in `vite.config.js`

---

## 📱 Development Mode (Local Testing)

To test locally before deploying:

```bash
# Terminal 1: Start PHP dev server
cd backend
php -S localhost:8000

# Terminal 2: Start React dev server
cd frontend
npm run dev
# Will open at http://localhost:5173
```

Update `App.jsx` API_URL to `http://localhost:8000/api.php` for local dev.

---

## 🔄 Updating the App

To update after changes:

```bash
cd frontend
npm run build
rsync -av dist/ /var/www/devnotes/
# Or use SCP/FTP to upload
```

---

## 💾 Backup

Backup your notes database:

```bash
# Backup
cp /var/www/devnotes/backend/devnotes.db ~/backups/devnotes-$(date +%Y%m%d).db

# Restore
cp ~/backups/devnotes-20240101.db /var/www/devnotes/backend/devnotes.db
```

Or use the Export feature in the app (JSON format).

---

## 📊 Database Schema

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    mode TEXT DEFAULT "markdown",
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
```

---

## 🎯 Next Steps / Future Enhancements

Ideas for extending the app:

1. **User authentication** - Multi-user support
2. **Categories/Tags** - Organize notes better
3. **Syntax highlighting** - Use Prism.js or Highlight.js
4. **Real-time sync** - WebSockets for multi-device
5. **File attachments** - Upload images/files to notes
6. **Version history** - Track note changes over time
7. **Sharing** - Generate shareable links
8. **Mobile app** - React Native version

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check server error logs
3. Verify file permissions
4. Test API endpoints directly with curl

---

**Happy Note-Taking! 📝**
